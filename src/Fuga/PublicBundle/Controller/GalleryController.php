<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class GalleryController extends Controller
{
	public function indexAction()
	{
		if ('POST' == $_SERVER['REQUEST_METHOD'] && $this->isXmlHttpRequest()) {
			$criteria = 'publish=1';

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

		return $this->render('gallery/index.html.twig', compact('ages', 'firstAge'));
	}

	public function archiveAction()
	{
		$categories = $this->get('container')->getItems('gallery_age', 'publish=1');
		$pictures = $this->get('container')->getItems('gallery_picture', 'publish=1');

		return $this->render('gallery/index.html.twig', compact('ages', 'pictures'));
	}
	
}