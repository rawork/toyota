<?php

namespace Fuga\CommonBundle\Controller;

class ExceptionController extends Controller {
	
	public function indexAction($status_code, $status_text) {
		header("HTTP/1.0 ".$status_code." Not Found");
		$locale = $this->get('session')->get('locale');
		$project_logo = PRJ_LOGO;
		return $this->render('page.error.html.twig', compact('status_code', 'status_text', 'locale', 'project_logo'));
	}
	
}
