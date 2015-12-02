<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\PublicController;

class HistoryController extends PublicController
{
	public function __construct()
	{
		parent::__construct('history');
	}

	public function indexAction()
	{
		$years = $this->get('container')->getItem('history_year', 'publish=1');

		return $this->render('history/index.html.twig', compact('years'));
	}
	
}