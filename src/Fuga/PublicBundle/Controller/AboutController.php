<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\PublicController;

class AboutController extends PublicController
{
	public function __construct()
	{
		parent::__construct('about');
	}

	public function indexAction()
	{
		$tabs = $this->get('container')->getItems('about_tab', 'publish=1');

		return $this->render('about/index.html.twig', compact('tabs'));
	}
	
}