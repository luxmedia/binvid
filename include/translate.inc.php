<?php

	// Start session to make $_SESSION available
	if(!isset($_SESSION)) session_start();

	// GLOBAL VARS	
	if (!defined('__ROOT__')) define('__ROOT__', str_replace("\\","/",dirname(__FILE__)));

	// Set default language code
	define('DEFAULT_LANG', 'de');

	$_LANG = '';

	$dateTime = date("Y-m-d H:i:s");

	// load language file
	loadLangFile();

	// Load translation file
	function loadLangFile() {
		global $_LANG;
		// LANGUAGE FUNCTIONS
		if (!isset($_SESSION['lang'])) {
			setSessionLanguageToDefault();
		}

		if (file_exists(__ROOT__ . '/locale/lang.' . $_SESSION['lang'] . '.php')) {
			$_LANG = include(__ROOT__ . '/locale/lang.' . $_SESSION['lang'] . '.php');
		} elseif (file_exists(__ROOT__ . '/locale/lang.' . DEFAULT_LANG . '.php')) {
			$_LANG = include(__ROOT__ . '/locale/lang.' . DEFAULT_LANG . '.php');
		} else {
			$errors[] = array( 'text'=>'ERROR: Could not find language file!', 'name'=>$file['name']);
		}
	}

	// Put user language into environment variable
	function setSessionLanguageToDefault() {

		$lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);

		$supportedLang = ['de', 'en']; 
		$lang = in_array($lang, $supportedLang) ? $lang : DEFAULT_LANG;

		$_SESSION['lang'] = $lang;
	}

	// Get translation from language array
	function _LNG($phrase) {
		global $_LANG;
		
		if (isset($_LANG)) {
			return (!array_key_exists($phrase,$_LANG)) ? $phrase : $_LANG[$phrase];
		} else {
			return $phrase;
		}
	}