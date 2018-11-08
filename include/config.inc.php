<?php

    /**
     * Global configuration file
	 * Loads config.xml
	 * Loads language files
	 * Provides some global variables
	 * @author Volker Lux
     * @email volker.lux@dw.com
	 *
     */

    /*.
        require_module 'core';
        require_module 'file';
    .*/

	// ERROR REPORTING

	// PRODUCTION USE:
	//error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);

	// DEVELOPMENT USE:
	ini_set('display_errors', 1);
	error_reporting(E_ALL);

	// GLOBAL VARS
	if (!defined('__ROOT__')) define('__ROOT__', str_replace("\\","/",dirname(__FILE__)));

	// Start session to make $_SESSION available
	if(!isset($_SESSION)) session_start();

	// Language functions
	require_once(__ROOT__ . '/include/translate.inc.php');

	// LOAD CONFIG.XML
	if (file_exists(__ROOT__ . '/config.xml')) {
		$configXML = simplexml_load_file(__ROOT__ . '/config.xml');
	} else {
		debugLog('ERROR: Could not open ' . (__ROOT__ . '/config.xml'));
	}
	//print_r((string)$configXML->folder->uploadFolder);


	// GLOBAL VARS

	// Paths
	//$upload_folder_path = 'f:'.DS.'temp'.DS.'functions'.DS.'uploads';
	$upload_folder_path = 		isset($configXML->uploadFolder) ? (string) $configXML->uploadFolder : 'functions/uploads';

	// Logging and debug
	$log_path = 				isset($configXML->debugLogFolder) ? (string) $configXML->debugLogFolder : 'logs';
	$enableDebugLog = 			1;
