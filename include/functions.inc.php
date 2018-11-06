<?php

    /*.
        require_module 'core';
        require_module 'file';
    .*/

	// Start session to make $_SESSION available
	if(!isset($_SESSION)) session_start();

	// GLOBAL VARS
	if (!defined('__ROOT__')) define('__ROOT__', str_replace("\\","/",dirname(__FILE__)));

	require_once(__ROOT__ . '/include/config.inc.php');


	// GLOBAL FUNCTIONS

	/**
	 *
	 * Create debugging logfile
	 * @param string $log_msg
	 */
	function debugLog($log_msg) {

		if ($GLOBALS['enableDebugLog']) {
			if (!file_exists($GLOBALS['log_path'])) {
				// create directory/folder uploads.
				mkdir($GLOBALS['log_path'], 0777, true);
			}
			$log_file_data = $GLOBALS['log_path'].DS.'binvid_log_' . date('Y-m-d') . '.log';
			file_put_contents($log_file_data, print_r($log_msg) . "\r\n", FILE_APPEND);
		}
	}


	/**
	* Create HTML select options from simple XML object
	* @link https://stackoverflow.com/a/9851406
	* @param array $obj - simple xml array
	* @return string
	*/
	function createSelectOptionsFromXml($obj) {
		$html = '';
	    foreach ($obj as $select) {
	        foreach ($select->option as $option) {
	            $destiTitle = $option['title'];
	            $destiValue = $option;
	            $html .= '<option value="'.$destiValue.'">' . $destiTitle . '</option>';
	        }
	    }
        return $html;
	}

	/**
	 *
	 * Get file extension string
	 * @param string $filename
	 * @return array - associative array with 'filename' and 'extension'
	 */
	function getFilenameParts($filename) {
		$file_parts = [];
		if (function_exists('pathinfo')) {
			$file_parts = pathinfo($filename);
		} else {
			$arr = explode('.', $filename);
			$file_parts['extension'] = end($arr); // file extension only
			$file_parts['filename'] = array_pop($arr);
			//$fileName = basename($filename);
			//$file_parts['filename'] = preg_replace("/\.[^.]+$/", "", $fileName); // filename without extension
		}
		return $file_parts;
	}

	/**
	 *
	 * Sanitize filename
	 * @param string $filename
	 * @return string - with only letters, numbers and "-"
	 */
	function normalizeFilename($filename) {
		// Remove any character that is not alphanumeric, white-space, a hyphen or a underscore
		$filename = preg_replace('/[^a-z0-9\s\-\_]/i', '', $filename);
		// Replace all spaces with hyphens
		$filename = preg_replace('/\s/', '-', $filename);
		// Replace multiple hyphens with a single hyphen
		$filename = preg_replace('/\-\-+/', '-', $filename);
		// Remove leading and trailing hyphens, and then lowercase the URL
		$filename = strtolower(trim($filename, '-'));

		return $filename;
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
