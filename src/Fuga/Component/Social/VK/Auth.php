<?php
/**
 * Created by PhpStorm.
 * User: roman
 * Date: 10/02/16
 * Time: 12:19
 */

namespace Fuga\Component\Social\VK;


class Auth
{

	private $container;
	private $appId;
	private $appSharedSecret;

	public function __construct($container, $appId, $appSharedSecret)
	{
		$this->container = $container;
		$this->appId = $appId;
		$this->appSharedSecret = $appSharedSecret;
	}

	public function member()
	{
		$session = array();
		$member = false;
		$validKeys = array('expire', 'mid', 'secret', 'sid', 'sig');
		$appCookie = $_COOKIE['vk_app_' . $this->appId];
		if ($appCookie) {
			$sessionData = explode('&', $appCookie, 10);
			foreach ($sessionData as $pair) {
				list($key, $value) = explode('=', $pair, 2);
				if (empty($key) || empty($value) || !in_array($key, $validKeys)) {
					continue;
				}
				$session[$key] = $value;
			}
			foreach ($validKeys as $key) {
				if (!isset($session[$key])) return $member;
			}
			ksort($session);

			$sign = '';
			foreach ($session as $key => $value) {
				if ($key != 'sig') {
					$sign .= ($key . '=' . $value);
				}
			}
			$sign .= $this->appSharedSecret;
			$sign = md5($sign);
			if ($session['sig'] == $sign && $session['expire'] > time()) {
				$member = array(
					'id' => intval($session['mid']),
					'secret' => $session['secret'],
					'sid' => $session['sid']
				);
			}
		}

		return $member;
	}

}