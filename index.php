<?php

use Fuga\CommonBundle\Controller\AppController;
use Symfony\Component\HttpFoundation\Request;

require_once(__DIR__ . '/app/init.php');


$request = Request::createFromGlobals();

$kernel = new AppController();
$response = $kernel->handle($request);
if (!is_object($response)){
	$container->get('log')->addError('link'.$_SERVER['REQUEST_URI']);
	$container->get('log')->addError('response'.serialize($response));
}
$response->send();