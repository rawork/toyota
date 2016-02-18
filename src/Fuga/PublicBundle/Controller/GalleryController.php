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

			if (!$user) {
				return array(
					'voted' => false,
					'redirect' => '/pictures/login',
				);
			}

			if ($user['publish'] == 0) {
				return array(
					'voted' => false,
					'redirect' => '/pictures/profile',
				);
			}

			$voteIsDisabled = $this->getManager('Fuga:Common:Param')->getValue('gallery', 'vote_disabled');
			$votePeriod = $this->getManager('Fuga:Common:Param')->getValue('gallery', 'vote_period');

			$pictureId = $this->get('request')->request->getInt('picture');
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

			$vote = $this->get('container')->getItem('gallery_vote', 'picture_id='.$pictureId.' AND user_id='.$user['id']);
			if($vote) {
				return array(
					'voted' => true,
					'message' => 'Вы уже голосовали за эту работу.'
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

	public function authAction()
	{
		if ('POST' == $_SERVER['REQUEST_URI'] && $this->isXmlHttpRequest()) {

			$network = $_POST['network'];
			$firstName = $_POST['first_name'];
			$lastName = $_POST['last_name'];
			$email = $_POST['email'];


			$member = $this->get($network)->member();

			if($member === false) {
				/* Пользователь неавторизован в Open API */

				return array(
					'status' => false,
					'message' => 'Пользователь не авторизован',
				);
			}

			$user = $this->get('container')->getItem('gallery_user', 'network="'.$network.'" AND mid='.$member['id']);

			if (!$user) {
				$this->get('container')->addItem(
					'gallery_user',
					array(
						'network'       => $network,
						'mid'           => $member['id'],
						'email'         => $email,
						'name'          => $firstName,
						'lastname'      => $lastName,
						'password'      => md5($this->get('util')->genKey(8)),
						'auto'          => '',
						'birthdate'     => '0000-00-00',
						'is_subscribed' => 0,
						'publish'       => 0,
				));
			}

			return array(
				'status' => true,
				'message' => 'Пользователь авторизован',
				'user' => $user,
			);
		}

		throw $this->createNotFoundException('Несуществующая страница');
	}

	public function loginAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD']) {

			$email = $this->get('request')->request->get('login');
			$password = $this->get('request')->request->get('password');
			if (empty($email) || empty($password)) {
				return array(
					'status' => false,
					'message' => 'Пустой e-mail или пароль',
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
					'status' => false,
					'reload' => false,
					'message' => 'Ошибка авторизации: неправильные учетные данные '.$email.'_'.$password.'_'.$passwordHash,
					'user' => $user,
				);
			}

			$token = md5($user['email'].$user['password']);

			unset($user['password']);
			$this->get('session')->set('gallery_user', $user);

			return array(
				'status' => true,
				'reload' => true,
				'message' => 'Вы авторизованы',
				'user' => $user,
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

			if (empty($email) || empty($password)) {
				return array(
					'status' => false,
					'reload' => false,
					'message' => 'Пустой e-mail или пароль',
				);
			}

			if (!$this->get('util')->isEmail($email)) {
				return array(
					'status' => false,
					'reload' => false,
					'message' => 'Некорректный формат e-mail',
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

				$this->get('mailer')->send(
					'Регистрация на сайте dreamcar.toyota.ru',
					$this->render('mail/register.html.twig'),
					$email
				);
			} catch (\Exception $e) {
				return array(
					'status' => false,
					'reload' => false,
					'message' => 'Ошибка при регистрации пользователя: '.$e->getMessage(),
				);
			}


			return array(
				'status' => true,
				'reload' => false,
				'redirect' => '/pictures/profile',
				'message' => 'Благодарим за регистрацию!<br><br>Теперь Вы можете принять участие в голосовании!',
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
					'status' => false,
					'reload' => false,
					'message' => 'Вы не авторизованы',
				);
			}

			try {
				$this->get('container')->updateItem(
					'gallery_user',
					array(
						'name' => $this->get('request')->request->get('name'),
						'lastname' => $this->get('request')->request->get('lastname'),
						'age' => $this->get('request')->request->get('age'),
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
					'reload' => false,
					'message' => $e->getMessage(),
				);
			}


			return array(
				'status' => true,
				'reload' => false,
				'message' => 'Благодарим за регистрацию!<br><br>Теперь Вы можете принять участие в голосовании!',
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
					'status' => false,
					'reload' => false,
					'message' => 'С указанным e-mail пользователь не зарегистрирован'
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
				'reload' => false,
				'message' => 'На указанный e-mail отправлены новые регистрационные данные',
			);
		}

		return $this->render('gallery/forgot.html.twig');
	}

	public function verifyAction($network)
	{
		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()) {

			$response = new JsonResponse();
			$result = $this->get($network)->verify();

			if ($result['status']) {
				$this->get('session')->set('gallery_user', $result['user_local']);
			}

			$response->setData($result);

			return $response;
		}

		$result = $this->get($network)->verify();

		if ($result['status']) {
			$this->get('session')->set('gallery_user', $result['user_local']);
		}


		$maincontent = $result['message'];
		$close = $result['status'];

		$response = new Response();
		$response->setContent($this->render('page.empty.html.twig', compact('maincontent', 'close')));

		return $response;
	}

	public function logoutAction()
	{
		$this->get('session')->remove('gallery_user');
		return $this->redirect('/pictures', 301);
	}

	public function fblogoutAction() {
		$this->get('fb')->logout();
	}
	
}