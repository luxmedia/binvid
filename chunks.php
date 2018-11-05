<?php

    /**
     * @author Gregory Chris (http://online-php.com)
     * @email www.online.php@gmail.com
     * @editor Bivek Joshi (http://www.bivekjoshi.com.np)
     * @email meetbivek@gmail.com
     * HEAVILY MODIFIED by Veny T
     * This is a plain PHP version for dropzone
     * Chunks collected in uploads/tmp/
     * Whole files placed in uploads/whole_from_chunks/
     * Name of the final file returned upon finished process
	 *
	 * MODIFIED by David Wagner
	 * MODIFIED 2018-10-29 - by Volker Lux
     */

	// Start session to make $_SESSION available
	if(!isset($_SESSION)) session_start();

	define('DS', '/');

	// GLOBAL VARS
	if (!defined('__ROOT__')) define('__ROOT__', str_replace("\\","/",dirname(__FILE__)));

	require_once(__ROOT__ . '/include/config.inc.php');
	require_once(__ROOT__ . '/include/functions.inc.php');

    /**
     *
     * Build json header
     */
    function returnJson($arr){
        header('Content-type: application/json');

        print json_encode($arr);
        exit;
    }


	// Analyze file object
	if (!empty($_FILES)){
		debugLog("_FILES: --> " . var_dump($_FILES));
		foreach ($_FILES as $file) {
			debugLog('POST DATA: $_FILE ->' . print_r($file));
			debugLog('POST DATA: $_POST ->' . print_r($_POST));
			if ($file['error'] != 0) {
				$errors[] = array( 'text'=>'File error', 'error'=>$file['error'], 'name'=>$file['name']);
				debugLog(print_r("file['error'] : " . $file['error']));
				continue;
			}
			if(!$file['tmp_name']){
				$errors[] = array( 'text'=>'Tmp file not found', 'name'=>$file['name']);
				debugLog(print_r("file['tmp_name'] : " . $file['error']));
				continue;
			}

			$tmp_file_path = $file['tmp_name'];
			$filename =  (isset($file['filename']) )? $file['filename'] : $file['name'];

			// START UPLOAD PROCESS
			if( isset($_POST['dzuuid'])){
				$chunks_res = resumableUpload($tmp_file_path, $filename);
				if(!$chunks_res['final']){
					returnJson( $chunks_res );
				}
				$tmp_file_path = $chunks_res['path'];
			} else {
                debugLog("_POST['dzuuid'] is not set!");
            }
		}
	} else {
		debugLog('_FILES Object is empty! --> ' . var_dump($_FILES));
	}

	// Cleanup aborted file uploads
	// Remove according temporary folders
	// if (isset($_POST['method']) && $_POST['method'] == 'cleanup') {
		// debugLog(var_dump($_POST));
		// debugLog(var_dump($_FILE));
		// $dir = $GLOBALS['upload_folder_path'].DS."tmp".DS;
        // // $identifier = ( isset($_POST['file']) ) ? trim($_POST['dzuuid']) : '';

        // $cleanup_folder = "$dir$identifier";
	// }

    /**
     *
     * Delete temporary files
     * @param string $file_chunks_folder - directory path
     */
    function cleanUp($file_chunks_folder){
		debugLog('FUNC: cleanUp -> file_chunks_folder: ' . $file_chunks_folder);
        // rename the temporary directory (to avoid access from other concurrent chunks uploads) and than delete it
        if (rename($file_chunks_folder, $file_chunks_folder.'_UNUSED')) {
            rrmdir($file_chunks_folder.'_UNUSED');
        } else {
            rrmdir($file_chunks_folder);
        }
    }

	/**
     *
     * Create folders from dropzone upload
     * @param string $file_chunks_folder - directory path
     */
    function resumableUpload($tmp_file_path, $filename){

		//debug show Variables
		if (isset($_POST["newFileName"])) debugLog("Filename: " .$_POST["newFileName"]."\n");
		if (isset($_POST["newDestination"])) debugLog(" Destination Folder: ". $_POST["newDestination"]."\n");

		$successes = array();
        $errors = array();
        $warnings = array();
        $dir = $GLOBALS['upload_folder_path'].DS."tmp".DS;

            $identifier = ( isset($_POST['dzuuid']) ) ? trim($_POST['dzuuid']) : '';

            $file_chunks_folder = "$dir$identifier";
            if (!is_dir($file_chunks_folder)) {
                mkdir($file_chunks_folder, 0777, true);
            }

            //$filename = str_replace( array(' ','(', ')' ), '_', $filename ); # remove problematic symbols
            //$info = pathinfo($filename);
            //$extension = isset($info['extension'])? '.'.strtolower($info['extension']) : '';
            //$filename = normalizeFilename($info['filename']);
			$filename_parts = getFilenameParts($filename); // returns pathinfo
			$extension = isset($filename_parts['extension'])? '.'.strtolower($filename_parts['extension']) : '';
			$filename = normalizeFilename($filename_parts['filename']);

            $totalSize =   (isset($_POST['dztotalfilesize']) )?    (int)$_POST['dztotalfilesize'] : 0;
            $totalChunks = (isset($_POST['dztotalchunkcount']) )?  (int)$_POST['dztotalchunkcount'] : 0;
            $chunkInd =  (isset($_POST['dzchunkindex']) )?         (int)$_POST['dzchunkindex'] : 0;
            $chunkSize = (isset($_POST['dzchunksize']) )?          (int)$_POST['dzchunksize'] : 0;
            $startByte = (isset($_POST['dzchunkbyteoffset']) )?    (int)$_POST['dzchunkbyteoffset'] : 0;

            $chunk_file = "$file_chunks_folder".DS."{$filename}.part{$chunkInd}";

            if (!move_uploaded_file($tmp_file_path, $chunk_file)) {
                $errors[] = array( 'text'=>'Move error', 'name'=>$filename, 'index'=>$chunkInd );
            }

            if( count($errors) == 0 and $new_path = checkAllParts(  $file_chunks_folder,
                                                                    $filename,
                                                                    $extension,
                                                                    $totalSize,
                                                                    $totalChunks,
                                                                    $successes, $errors, $warnings) and count($errors) == 0){
                return array('final'=>true, 'path'=>$new_path, 'successes'=>$successes, 'errors'=>$errors, 'warnings' =>$warnings);
            }
		return array('final'=>false, 'successes'=>$successes, 'errors'=>$errors, 'warnings' =>$warnings);
    }

    /**
     *
     * Check if file chunks exist and create final file
     */
    function checkAllParts( $file_chunks_folder,
                            $filename,
                            $extension,
                            $totalSize,
                            $totalChunks,
                            &$successes, &$errors, &$warnings){

        // reality: count all the parts of this file
		debugLog("FUNC: checkAllParts"."\n");
        $parts = glob("$file_chunks_folder/*");
        $successes[] = count($parts)." of $totalChunks parts done so far in $file_chunks_folder";

        // check if all the parts present, and create the final destination file
        if( count($parts) == $totalChunks ){
            $loaded_size = 0;
            foreach($parts as $file) {
                $loaded_size += filesize($file);
            }

			//Read new Filename from Form
			$identifier = ( isset($_POST['dzuuid']) ) ? trim($_POST['dzuuid']) : '';
			$dynTitleName = 'title_'. $identifier; // get title from fields for each file
			debugLog("FUNC: checkAllParts -> Dynamic Filename (title_$identifier) : " . $_POST[$dynTitleName]);

			if ( isset($_POST[$dynTitleName]) && !empty($_POST[$dynTitleName]) ) {
				$newFileName = $_POST[$dynTitleName];
			}
			elseif (isset($_POST['newFileName']) && !empty($_POST['newFileName'])) {
				$newFileName = $_POST["newFileName"];
			}
			else {
				$newFileName = $filename;
			}

			//$newFileName = normalizeFilename($newFileName); // Sanitize filename

            if ($loaded_size >= $totalSize and $new_path = createFileFromChunks(
                                                            $file_chunks_folder,
                                                            $filename,
															$newFileName,
                                                            $extension,
                                                            $totalSize,
                                                            $totalChunks,
                                                            $successes, $errors, $warnings) and count($errors) == 0){
                cleanUp($file_chunks_folder);
                return $new_path;
            }
        }
		return false;
    }


    /**
     * Check if all the parts exist, and
     * gather all the parts of the file together
     * @param string $file_chunks_folder - the temporary directory holding all the parts of the file
     * @param string $fileName - the original file name
     * @param string $totalSize - original file size (in bytes)
     */
    function createFileFromChunks($file_chunks_folder, $fileName, $newFileName , $extension, $total_size, $total_chunks,
                                            &$successes, &$errors, &$warnings) {

		// Completed Upload Path
		//$rel_path = "functions/uploads/completed/";
		debugLog('FUNC: createFileFromChunks');
		$rel_path = $GLOBALS['upload_folder_path'] .DS."completed" . DS . trim($_POST["newDestination"]) . DS;
		$newDestination = $_POST["newDestination"];

        $saveName = getNextAvailableFilename( $rel_path, $newFileName, $extension, $errors );

        if( !$saveName ){
            return false;
        }

		// create complted folder if it does not exist yet
		if (!is_dir($rel_path)) {
			mkdir($rel_path, 0777, true);
		}

        $fp = fopen("$rel_path$saveName$extension", 'w');
        if ($fp === false) {
            $errors[] = 'cannot create the destination file';
            return false;
        }
        for ($i=0; $i<$total_chunks; $i++) {
			// debugLog('FUNC: createFileFromChunks -> fwrite' . $file_chunks_folder.DS.$fileName.'.part'.$i);
            fwrite($fp, file_get_contents($file_chunks_folder.DS.$fileName.'.part'.$i));
        }
        fclose($fp);

        return "$rel_path$saveName$extension";
    }

    /**
     *
     * Check for further files using a numeric index counter as filename suffix
     */
    function getNextAvailableFilename( $rel_path, $orig_file_name, $extension, &$errors ){
        if( file_exists("$rel_path$orig_file_name$extension") ){
            $i=0;
            while(file_exists("$rel_path{$orig_file_name}_".(++$i).$extension) and $i<10000){}
            if( $i >= 10000 ){
                $errors[] = "Can not create unique name for saving file $orig_file_name$extension";
                return false;
            }
        return $orig_file_name."_".$i;
        }
    return $orig_file_name;
    }
?>
