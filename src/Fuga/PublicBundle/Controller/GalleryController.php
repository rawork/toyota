<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\PublicController;

class GalleryController extends PublicController
{
	public function __construct()
	{
		parent::__construct('gallery');
	}

	public function indexAction()
	{
		$ages = $this->get('container')->getItems('gallery_age', 'publish=1');
		$firstAge = reset($ages);
//		$pictures = $this->get('container')->getItems('gallery_picture', 'publish=1');

		return $this->render('gallery/index.html.twig', compact('ages', 'firstAge'));
	}

	public function archiveAction()
	{
		$categories = $this->get('container')->getItems('gallery_age', 'publish=1');
		$pictures = $this->get('container')->getItems('gallery_picture', 'publish=1');

		return $this->render('gallery/index.html.twig', compact('ages', 'pictures'));
	}
	
}