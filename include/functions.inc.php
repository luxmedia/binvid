<?php

	// Start session to make $_SESSION available
	if(!isset($_SESSION)) session_start();

	// GLOBAL VARS	
	if (!defined('__ROOT__')) define('__ROOT__', str_replace("\\","/",dirname(__FILE__)));

	require_once(__ROOT__ . '/include/config.inc.php');

	// GLOBAL FUNCTIONS

	/**
	 *
	 * Helper: Create debugging logfile
	 */
	function debugLog($log_msg) {

		if ($GLOBALS['enableDebugLog']) {
			if (!file_exists($GLOBALS['log_path'])) 
			{
				// create directory/folder uploads.
				mkdir($GLOBALS['log_path'], 0777, true);
			}
			$log_file_data = $GLOBALS['log_path'].DS.'binvid_log_' . date('Y-m-d') . '.log';
			file_put_contents($log_file_data, print_r($log_msg) . "\r\n", FILE_APPEND);		
		}
	}

	/**
	 *
	 * Helper: get file extension
	 * @return: associative array with 'filename' and 'extension'
	 */	
	function getFilenameParts($filename) {
		$file_parts = [];
		if (function_exists('pathinfo')) {
			$file_parts = pathinfo($filename);
		} else {
			$array = explode('.', $filename);
			$file_parts['extension'] = end($array); // file extension only			
			$file_parts['filename'] = array_pop($array);
			//$fileName = basename($filename);
			//$file_parts['filename'] = preg_replace("/\.[^.]+$/", "", $fileName); // filename without extension
		}
		return $file_parts;
	}

	/**
	 *
	 * Helper: Sanitize filename
	 * @return: string with only letters, numbers and "-"
	 */
	function normalizeFilename($string) {
		// Remove any character that is not alphanumeric, white-space, a hyphen or a underscore
		$string = preg_replace('/[^a-z0-9\s\-\_]/i', '', $string);
		// Replace all spaces with hyphens
		$string = preg_replace('/\s/', '-', $string);
		// Replace multiple hyphens with a single hyphen
		$string = preg_replace('/\-\-+/', '-', $string);
		// Remove leading and trailing hyphens, and then lowercase the URL
		$string = strtolower(trim($string, '-'));

		return $string;
	}


	/**
	 *
	 * Delete a directory RECURSIVELY
	 * @param string $dir - directory path
	 * @link http://php.net/manual/en/function.rmdir.php
	 */
	function rrmdir($dir) {
		if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != "." && $object != "..") {
					if (filetype("$dir/$object") == "dir") {
						rrmdir("$dir/$object");
					} else {
						unlink("$dir/$object");
					}
				}
			}
			reset($objects);
			rmdir($dir);
		}
	}