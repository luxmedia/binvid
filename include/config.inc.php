<?php 

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
	//$configXML = simplexml_load_file(__ROOT__ . '/config.xml') or die("Error: Cannot create object");
	//print_r((string)$configXML->folder->uploadFolder);


	// GLOBAL VARS
	
	// Paths
	//$upload_folder_path = 'f:'.DS.'temp'.DS.'functions'.DS.'uploads';
	$upload_folder_path = 		'functions/uploads'; // (string) $configXML->folder->debugLogFolder
	
	// Logging and debug
	$log_path = 				'logs'; // (string) $configXML->folder->debugLogFolder; // folder for custom debug logging
	$enableDebugLog = 			1;