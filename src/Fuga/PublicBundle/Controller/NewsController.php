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

	public function indexAction($year = 0, $month = 0)
	{
		$date = new \DateTime();
		if (0 == $year) {
			$year = $date->format('Y');
		}

		if (0 == $month) {
			$month = $date->format('n');
		}

		$criteria = 'publish=1';

		if ($year > 0) {
			$criteria .= ' AND YEAR(date) = '.$year;
		}

		if ($month > 0) {
			$criteria .= ' AND MONTH(date) = '.$month;
		}

		$news = $this->get('container')->getItems('news_news', $criteria);

		return $this->render('news/index.html.twig', compact('news', 'year', 'month'));
	}

	public function detailAction($id)
	{
		$news = $this->get('container')->getItem('news_news', $id);
		if (!$news) {
			throw $this->createNotFoundException('Событие '.$id.'  не найдено.');
		}

		$prev = $this->get('container')->getItem('news_news', 'date<"'.$news['date'].'"');
		$next = $this->get('container')->getItem('news_news', 'date>"'.$news['date'].'"', 'date ASC');

		return $this->render('news/detail.html.twig', compact('news', 'prev', 'next'));
	}

	public function calendarAction($year = 0, $month = 0)
	{
		$sql = 'SELECT min(YEAR(created)) as min, max(YEAR(created)) as max FROM news_news';
		$years = $this->get('connection')->fetchAssoc($sql);

		return $this->render('news/calendar.html.twig', compact('years', 'year', 'month'));
	}

}