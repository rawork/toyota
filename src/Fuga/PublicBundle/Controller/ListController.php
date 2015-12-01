<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\PublicController;

class ListController extends PublicController
{
	public function __construct()
	{
		parent::__construct('list');
	}

	public function indexAction()
	{
		$scans = $this->get('container')->getItems('list_page', 'publish=1');

		return $this->render('list/index.html.twig', compact('scans'));
	}
	
}