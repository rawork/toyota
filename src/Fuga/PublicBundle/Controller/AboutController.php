<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\Controller;

class AboutController extends Controller
{
	public function indexAction()
	{
		$tabs = $this->get('container')->getItems('about_tab', 'publish=1');

		return $this->render('about/index.html.twig', compact('tabs'));
	}

	public function sliderAction()
	{
		$slides = $this->get('container')->getItems('about_slide', 'publish=1');

		return $this->render('about/slider.html.twig', compact('slides'));
	}
	
}