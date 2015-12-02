<?php

namespace Fuga\PublicBundle\Controller;

use Fuga\CommonBundle\Controller\PublicController;
use Symfony\Component\HttpFoundation\JsonResponse;

class NewsController extends PublicController
{
	public function __construct()
	{
		parent::__construct('news');
	}

	public function indexAction()
	{
		$news = $this->get('container')->getItems('news_news', 'publish=1');

		return $this->render('news/index.html.twig', compact('news'));
	}

	public function detailAction($id)
	{
		$news = $this->get('container')->getItem('news_news', 'publish=1');

		return $this->render('news/detail.html.twig', compact('news'));
	}

	public function archiveAction()
	{
		$years = $this->get('container')->getItems('news_news', 'publish=1');
		$months = $this->get('container')->getItems('news_news', 'publish=1');

		return $this->render('news/archive.html.twig', compact('years', 'months'));
	}

	public function addAction()
	{
		if ($this->isXmlHttpRequest()) {

			$data = array(
				'name' => $this->get('request')->request->get('name', ''),
				'email' => $this->get('request')->request->get('email', ''),
				'position' => '',
				'feedback' => $this->get('request')->request->get('message'),
				'created' => date('Y-m-d H-i:s'),
				'updated' => '0000-00-00 00:00:00',
				'sort' => 500,
				'publish' => 0,
			);

			$this->get('container')->addItem(
				'book_feedback',
				$data
			);

			$text = 'Новый отзыв на сайте '.$_SERVER['SERVER_NAME']."\n";
			$text .= '------------------------------------------'."\n";
			$text .= 'Имя: '.$data['name']."\n";
			$text .= 'E-mail: '.$data['email']."\n";
			$text .= 'E-mail: '.$data['feedback']."\n\n";
			$text .= 'Сообщение сгенерировано автоматически.'."\n";

			$this->get('mailer')->send(
				'Новый отзыв. Сайт '.$_SERVER['SERVER_NAME'],
				nl2br($text),
				ADMIN_EMAIL
			);

			$response = new JsonResponse();
			$response->setData(array(
				'content' => $this->render('book/add.html.twig'),
			));

			return $response;
		}

		return $this->redirect($this->generateUrl('public_page'));
	}
	
}