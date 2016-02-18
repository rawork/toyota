<?php

namespace Fuga\Component\Social\VK;


class Auth
{

	private $container;
	private $appId;
	private $appSharedSecret;
	private $redirectURI;
	private $url;

	public function __construct($container, $appId, $appSharedSecret, $redirectURI, $url)
	{
		$this->container = $container;
		$this->appId = $appId;
		$this->appSharedSecret = $appSharedSecret;
		$this->redirectURI = $redirectURI;
		$this->url = $url;
	}

//	public function member()
//	{
//		$session = array();
//		$member = false;
//		$validKeys = array('expire', 'mid', 'secret', 'sid', 'sig');
//		$appCookie = $_COOKIE['vk_app_' . $this->appId];
//		if ($appCookie) {
//			$sessionData = explode('&', $appCookie, 10);
//			foreach ($sessionData as $pair) {
//				list($key, $value) = explode('=', $pair, 2);
//				if (empty($key) || empty($value) || !in_array($key, $validKeys)) {
//					continue;
//				}
//				$session[$key] = $value;
//			}
//			foreach ($validKeys as $key) {
//				if (!isset($session[$key])) return $member;
//			}
//			ksort($session);
//
//			$sign = '';
//			foreach ($session as $key => $value) {
//				if ($key != 'sig') {
//					$sign .= ($key . '=' . $value);
//				}
//			}
//			$sign .= $this->appSharedSecret;
//			$sign = md5($sign);
//			if ($session['sig'] == $sign && $session['expire'] > time()) {
//				$member = array(
//					'id' => intval($session['mid']),
//					'secret' => $session['secret'],
//					'sid' => $session['sid']
//				);
//			}
//		}
//
//		return $member;
//	}

	public function verify()
	{
		$result = array(
			'status' => false,
			'user' => null,
			'user_local' => null,
			'message' => 'Error',
		);
		$params = array(
			'client_id' => $this->appId,
			'client_secret' => $this->appSharedSecret,
			'code' => $_GET['code'],
			'redirect_uri' => $this->redirectURI,
		);

		if (isset($_GET['code'])) {

			try {

				$token = json_decode(file_get_contents('https://oauth.vk.com/access_token' . '?' . urldecode(http_build_query($params))), true);

				if (isset($token['access_token'])) {
					$params = array(
						'uids' => $token['user_id'],
						'fields' => 'uid,first_name,last_name,bdate',
						'access_token' => $token['access_token']
					);

					$userInfo = json_decode(file_get_contents('https://api.vk.com/method/users.get' . '?' . urldecode(http_build_query($params))), true);
					if (isset($userInfo['response'][0]['uid'])) {
						/*
						uid
						first_name
						last_name
						bdate - not exists if not filled
						*/
						$userInfo = $userInfo['response'][0];

						$userInfo['email'] = $token['email'];
						$userInfo['network'] = 'vk';
						$userInfo['age'] = '';

						if (isset($userInfo['bdate'])) {
							$dateArray = explode('.', $userInfo['bdate']);
							$userInfo['age'] = isset($dateArray[2]) ? intval(date('Y')) - intval($dateArray[2]) : '';
						}

						$result['status'] = true;
						$result['message'] = "Success";
						$result['user'] = $userInfo;

						$localUser = $this->container->getItem('gallery_user', 'social_user_id="'.$userInfo['uid'].'"');
						if ($localUser) {
							unset($localUser['password']);
						} else {
							$userId = $this->container->addItem('gallery_user', array(
								'email' => $userInfo['email'],
								'password' => md5($this->container->get('util')->genKey(8)),
								'name' => $userInfo['first_name'],
								'lastname' => $userInfo['last_name'],
								'age' => $userInfo['age'],
								'social_name' => $userInfo['network'],
								'social_user_id' => $userInfo['uid'],
							));
							$localUser = $this->container->getItem('gallery_user', 'social_user_id="'.$userInfo['uid'].'"');
						}

						$result['user_local'] = $localUser;

					}
				}
			} catch (\Exception $e) {
				$result['message'] = $e->getMessage();
				$this->container->get('log')->addError($e->getMessage());
			}
		}

		return $result;
	}

	public function url()
	{
		$params = array(
			'client_id'     => $this->appId,
			'display' 		=> 'popup',
			'redirect_uri'  => $this->redirectURI,
			'response_type' => 'code',
			'scope' 		=> 'email',
		);

		return $this->url . '?' . urldecode(http_build_query($params));
	}

}