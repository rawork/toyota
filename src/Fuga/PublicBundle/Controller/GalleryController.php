<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\PublicController;
use Symfony\Component\HttpFoundation\JsonResponse;

class GalleryController extends PublicController
{
	public function __construct()
	{
		parent::__construct('gallery');
	}

	public function indexAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()) {
			$category = $this->get('request')->request->getInt('category');
			$name = $this->get('request')->request->get('name');
			$city = $this->get('request')->request->get('city');

			$response = new JsonResponse();
			$response->setData(array(
				'pictures' => $pictures = $this->get('container')->getItems('gallery_picture', 'publish=1')
			));

			return $response;
		}

		$ages = $this->get('container')->getItems('gallery_age', 'publish=1');
		$firstAge = reset($ages);

		return $this->render('gallery/index.html.twig', compact('ages', 'firstAge'));
	}

	public function archiveAction()
	{
		$categories = $this->get('container')->getItems('gallery_age', 'publish=1');
		$pictures = $this->get('container')->getItems('gallery_picture', 'publish=1');

		return $this->render('gallery/index.html.twig', compact('ages', 'pictures'));
	}
	
}