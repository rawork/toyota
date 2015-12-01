<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\PublicController;
use Symfony\Component\HttpFoundation\JsonResponse;

class ContactController extends PublicController
{
	public function __construct()
	{
		parent::__construct('read');
	}

	public function indexAction()
	{
		$cities = $this->get('container')->getItems('contact_city', 'publish=1');

		return $this->render('contact/index.html.twig', compact('cities'));
	}

	public function cityAction() {
		$response = new JsonResponse();

		$response->setData(array(
			'cities' => $this->get('container')->getItems('contact_city', 'publish=1'),
		));

		$response->headers->set('Access-Control-Allow-Origin', '*');

		return $response;
	}

	public function dealerAction() {
		$id = $this->get('request')->request->getInt('id');
		$response = new JsonResponse();

		$response->setData(array(
			'dealers' => $this->get('container')->getItems('contact_dealer', 'city_id='.$id.' AND publish=1'),
		));

		$response->headers->set('Access-Control-Allow-Origin', '*');

		return $response;
	}
	
}