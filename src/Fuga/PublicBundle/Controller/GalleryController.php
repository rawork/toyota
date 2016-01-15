<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

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

			$response = new JsonResponse();
			$response->setData(array(
				'pictures' => $this->get('container')->getItems('gallery_picture', $criteria),
				'vote_disabled' => $this->getManager('Fuga:Common:Param')->getValue('gallery', 'vote_disabled'),
			));

			return $response;
		}

		$ages = $this->get('container')->getItems('gallery_age', 'publish=1');
		$firstAge = reset($ages);
		$isArchive = false;
		$link = $this->generateUrl('public_page_dinamic', array('node' => 'pictures', 'action' => 'archive'));
		$button = $this->getManager('Fuga:Common:Param')->getValue('gallery', 'button_archive_title');

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
				'vote_disabled' => $this->getManager('Fuga:Common:Param')->getValue('gallery', 'vote_disabled'),
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
			$vote = $this->get('container')->getItem('gallery_vote', 'picture_id='.$pictureId.' AND ( session_id="'.$sessionId.'" OR ip_address="'.$ip.'") AND created > "'.$date->format('Y-m-d H:i:s').'"');
			if($votePeriod > 0 && $vote) {
				return array(
					'voted' => false,
					'error' => 'Вы уже голосовали в ближайшее время. Попробуйте повторить позже.'
				);
			} else {
				$this->get('container')->addItem('gallery_vote', array(
					'picture_id' => $pictureId,
					'session_id' => $sessionId,
					'ip_address' => $ip
				));

				return array(
					'voted' => true,
					'message' => 'Спасибо. Ваш голос учтен.'
				);
			}
		}

		return $this->redirect($this->generateUrl('public_page' ,array('node' => 'pictures')), 301);
	}
	
}