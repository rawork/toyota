<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class GalleryController extends Controller
{
	public function indexAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()) {
			$criteria = 'publish=1 AND is_archive<>1';

			$category = $this->get('request')->request->getInt('category');
			$person = $this->get('request')->request->get('person');
			$city = $this->get('request')->request->get('city');

			if ($category > 0) {
				$criteria .= ' AND age_id='.$category;
			}

			if (trim($city) != '') {
				$criteria .= ' AND city="'.$city.'"';
			}

			if (trim($person) != '') {
				$criteria .= ' AND person LIKE("%'.$person.'%")';
			}

			$pictures = $this->get('container')->getItems('gallery_picture', $criteria);
			$user = $this->get('session')->get('gallery_user');

			foreach ($pictures as &$picture) {
				$picture['vote'] = false;
				if ($user) {
					$picture['vote'] = $this->get('container')->getItem('gallery_vote', 'picture_id='.$picture['id'].' AND user_id="'.$user['id'].'"');
				}

				$picture['likes'] = $this->get('container')->count('gallery_vote', 'picture_id='.$picture['id']);
			}
			unset($picture);

			$response = new JsonResponse();
			$response->setData(array(
				'pictures' => $pictures,
				'vote_disabled' => $this->getManager('Fuga:Common:Param')->getValue('gallery', 'vote_disabled'),
				'gallery_disabled' => $this->getManager('Fuga:Common:Param')->getValue('gallery', 'gallery_disabled'),
			));

			return $response;
		}

		$ages = $this->get('container')->getItems('gallery_age', 'publish=1');
		$firstAge = reset($ages);
		$isArchive = false;
		$link = $this->generateUrl('public_page_dinamic', array('node' => 'pictures', 'action' => 'archive'));
		$button = $this->getManager('Fuga:Common:Param')->getValue('gallery', 'button_archive_title');

//		$this->get('log')->addError(json_encode($_COOKIE));
//		var_dump($this->get('session')->get('gallery_user'));

		return $this->render('gallery/index.html.twig', compact('ages', 'firstAge', 'isArchive', 'link', 'button'));
	}

	public function archiveAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()) {
			$criteria = 'publish=1 AND is_archive=1';

			$category = $this->get('request')->request->getInt('category');
			$person = $this->get('request')->request->get('person');
			$city = $this->get('request')->request->get('city');

			if ($category > 0) {
				$criteria .= ' AND age_id='.$category;
			}

			if (trim($city) != '') {
				$criteria .= ' AND city="'.$city.'"';
			}

			if (trim($person) != '') {
				$criteria .= ' AND person LIKE("%'.$person.'%")';
			}

			$response = new JsonResponse();
			$response->setData(array(
				'pictures' => $this->get('container')->getItems('gallery_picture', $criteria),
				'vote_disabled' => true,
			));

			return $response;
		}

		$ages = $this->get('container')->getItems('gallery_age', 'publish=1');
		$firstAge = reset($ages);
		$isArchive = true;
		$link = $this->generateUrl('public_page', array('node' => 'pictures'));
		$button = $this->getManager('Fuga:Common:Param')->getValue('gallery', 'button_index_title');

		return $this->render('gallery/index.html.twig', compact('ages', 'firstAge', 'isArchive', 'button', 'link'));
	}

	public function voteAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()) {

			$user = $this->get('session')->get('gallery_user');
			$pictureId = $this->get('request')->request->getInt('picture');

			if (!$user) {
				$this->get('session')->set('picture_voted', $pictureId);

				return array(
					'voted' => false,
					'redirect' => '/pictures/login',
				);
			}

			if ($user['publish'] == 0) {
				$this->get('session')->set('picture_voted', $pictureId);

				return array(
					'voted' => false,
					'redirect' => '/pictures/profile',
				);
			}

			$voteIsDisabled = $this->getManager('Fuga:Common:Param')->getValue('gallery', 'vote_disabled');
			$votePeriod = $this->getManager('Fuga:Common:Param')->getValue('gallery', 'vote_period');


			$sessionId = $this->get('session')->getId();
			$ip = $_SERVER['REMOTE_ADDR'];
			$time = time()-$votePeriod;
			$date = new \DateTime();
			$date->setTimestamp($time);

			if ($voteIsDisabled) {
				return array(
					'voted' => false,
					'error' => 'Голосование закрыто'
				);
			}

			if ($this->get('session')->has('picture_voted')){
				$this->get('session')->remove('picture_voted');
			}

			$vote = $this->get('container')->getItem('gallery_vote', 'picture_id='.$pictureId.' AND user_id='.$user['id']);
			if($vote) {
				return array(
					'voted' => true,
					'message' => 'Вы уже голосовали за эту работу.',
					'likes' => $this->get('container')->count('gallery_vote', 'picture_id='.$pictureId),
				);
			} else {
				$this->get('container')->addItem('gallery_vote', array(
					'picture_id' => $pictureId,
					'user_id'    => $user['id'],
					'session_id' => $sessionId,
					'ip_address' => $ip
				));

				return array(
					'voted' => true,
					'message' => 'Спасибо. Ваш голос учтен.',
					'likes' => $this->get('container')->count('gallery_vote', 'picture_id='.$pictureId),
				);
			}
		}

		return $this->redirect($this->generateUrl('public_page' ,array('node' => 'pictures')), 301);
	}

	public function loginAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD']) {

			$email = $this->get('request')->request->get('login');
			$password = $this->get('request')->request->get('password');
			if (empty($email) || empty($password)) {
				return array(
					'status' => false,
					'message' => 'Заполните E-mail и пароль',
				);
			}

			$passwordHash = md5($password);

			$sql = "SELECT *  FROM gallery_user WHERE email= :login AND password= :password LIMIT 1";
			$stmt = $this->get('connection')->prepare($sql);
			$stmt->bindValue("login", $email);
			$stmt->bindValue("password", $passwordHash);
			$stmt->execute();
			$user = $stmt->fetch();

			$this->get('log')->addError(json_encode($user));

			if (!$user) {
				return array(
					'status' => true,
					'task' => 'message',
					'message' => $this->render('gallery/nologin.html.twig'),
				);
			}

			$token = md5($user['email'].$user['password']);

			unset($user['password']);
			$this->get('session')->set('gallery_user', $user);

			return array(
				'status' => true,
				'task' => 'close',
				'message' => 'Вы авторизованы',
				'picture' => $this->get('session')->get('picture_voted'),
			);
		}


		$vk = $this->get('vk')->url();
		$fb = $this->get('fb')->url();

		return $this->render('gallery/login.html.twig', compact('vk', 'fb'));
	}

	public function registerAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD']) {

			$email = $this->get('request')->request->get('login');
			$password = $this->get('request')->request->get('password');
			$password2 = $this->get('request')->request->get('password_again');

			if (empty($email) || empty($password) || empty($password2)) {
				return array(
					'status' => false,
					'message' => 'Заполните E-mail и пароль',
				);
			}

			if (!$this->get('util')->isEmail($email)) {
				return array(
					'status' => false,
					'message' => 'Некорректный формат e-mail',
				);
			}

			if ($password != $password2) {
				return array(
					'status' => false,
					'message' => 'Пароли не совпадают',
				);
			}

			try {
				$userId = $this->get('container')->addItem('gallery_user', array(
					'email' => $email,
					'password' => md5($password),
					'age' => '',
					'name' => '',
					'lastname' => '',
				));

				$user = $this->get('container')->getItem('gallery_user', $userId);

				$this->get('session')->set('gallery_user', $user);

				$server_link = 'http://'.$_SERVER['SERVER_NAME'];

				$this->get('mailer')->send(
					'Регистрация на сайте dreamcar.toyota.ru',
					$this->render('mail/register.html.twig', compact('server_link')),
					$email
				);

			} catch (\Exception $e) {
				$this->get('log')->addError($e->getMessage());
				return array(
					'status' => false,
					'message' => 'Ошибка при регистрации пользователя. Напишите нам на info@toyota.ru',
				);
			}

			return array(
				'status' => true,
				'task' => 'redirect',
				'redirect' => '/pictures/profile',
			);
		}

		$vk = $this->get('vk')->url();
		$fb = $this->get('fb')->url();

		return $this->render('gallery/register.html.twig', compact('vk', 'fb'));
	}

	public function profileAction()
	{
		$user = $this->get('session')->get('gallery_user');
		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()){

			if (!$user) {
				return array(
					'status' => true,
					'reload' => true,
				);
			}

			try {
				$name = $this->get('request')->request->get('name');
				$lastname = $this->get('request')->request->get('lastname');
				$age = $this->get('request')->request->getInt('age');

				$emptyFields = array();

				if (empty($name)) {
					$emptyFields[] = 'Имя';
				}

				if (empty($lastname)) {
					$emptyFields[] = 'Фамилия';
				}

				if (empty($age)) {
					$emptyFields[] = 'Возраст';
				}

				if (count($emptyFields) > 0 ) {
					return array(
						'status' => false,
						'message' => 'Не заполнены обязательные поля:<br> '.implode(', ', $emptyFields),
					);
				}

				if (!is_int($age) || intval($age) < 1) {
					return array(
						'status' => false,
						'message' => 'Поле "Возраст" должно содержать только положительные цифры',
					);
				}

				$this->get('container')->updateItem(
					'gallery_user',
					array(
						'name' => $name,
						'lastname' => $lastname,
						'age' => $age,
						'is_driver' => $this->get('request')->request->getInt('is_driver', 0),
						'auto_brand' => $this->get('request')->request->get('auto_brand'),
						'auto_model' => $this->get('request')->request->get('auto_model'),
						'is_subscribed' => $this->get('request')->request->getInt('is_subscribed', 0),
						'publish' => 1,
					),
					array('id' => $user['id'])
				);

				$user = $this->get('container')->getItem('gallery_user', $user['id']);
				unset($user['password']);
				$this->get('session')->set('gallery_user', $user);
			} catch (\Exception $e) {
				$this->get('log')->addError($e->getMessage());
				return array(
					'status' => false,
					'message' => 'Ошибка регистрации. Напишите нам  info@toyota.ru.',
				);
			}

			return array(
				'status'  => true,
				'task'    => 'message',
				'message' => 'Благодарим за регистрацию!<br><br>Теперь Вы можете принять участие в голосовании!',
				'picture' => $this->get('session')->get('picture_voted'),
			);
		}

		return $this->render('gallery/profile.html.twig', compact('user'));
	}

	public function forgotAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()) {
			$email = $this->get('request')->request->get('login');

			$user = $this->get('container')->getItem('gallery_user', 'email="'.$email.'"');
			if (!$user) {
				return array(
					'status' => true,
					'task' => 'message',
					'message' => $this->render('gallery/noforgot.html.twig'),
				);
			}

			$password = $this->get('util')->genKey(8);

			$this->get('container')->updateItem(
				'gallery_user',
				array('password' => md5($password)),
				array('email' => $email)
			);

			$this->get('mailer')->send(
				'Сброс пароля на сайте '.$_SERVER['SERVER_NAME'],
				$this->render('mail/forgot.html.twig', compact('email', 'password')),
				$email
			);

			return array(
				'status' => true,
				'task' => 'message',
				'message' => 'Спасибо! Новый пароль был выслан на указанный e-mail',
			);
		}

		return $this->render('gallery/forgot.html.twig');
	}

	public function verifyAction($network)
	{
//		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()) {
//
//			$response = new JsonResponse();
//			$result = $this->get($network)->verify();
//
//			if ($result['status']) {
//				$this->get('session')->set('gallery_user', $result['user_local']);
//			}
//
//			$response->setData($result);
//
//			return $response;
//		}

		$result = $this->get($network)->verify();

		if ($result['status']) {
			$this->get('session')->set('gallery_user', $result['user_local']);

			$server_link = 'http://'.$_SERVER['SERVER_NAME'];

			$this->get('mailer')->send(
				'Регистрация на сайте dreamcar.toyota.ru',
				$this->render('mail/register.html.twig', compact('server_link')),
				$result['user_local']['email']
			);
		}


		$maincontent = $result['message'];

		$profile = false;
		$close = false;
		$picture = '';

		if ($result['status'] && $result['register'] ) {
			$picture = $this->get('session')->get('picture_voted');
			$profile = true;
		} else {
			if ($result['status']) {
				$picture = $this->get('session')->get('picture_voted');
			}
			$close = $result['status'];

		}

		$response = new Response();
		$response->setContent($this->render('page.empty.html.twig', compact('maincontent', 'close', 'profile', 'picture')));

		return $response;
	}

	public function userAction()
	{
		$user = $this->get('session')->get('gallery_user');
		$vote_disabled = $this->getManager('Fuga:Common:Param')->getValue('gallery', 'vote_disabled');

		if ($this->isXmlHttpRequest()) {
			return array(
				'content' => $this->render('gallery/user.html.twig', compact('user', 'vote_disabled')),
			);
		} else {
			return $this->render('gallery/user.html.twig', compact('user', 'vote_disabled'));
		}
	}

	public function logoutAction()
	{
		$this->get('session')->remove('gallery_user');

		return $this->redirect('/pictures', 301);
	}
	
}