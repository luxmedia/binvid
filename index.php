<?php

    /**
     * Dropzone.js based webinterface for video/audio file transfer to webserver
	 * @author Volker Lux
     * @email volker.lux@dw.com
	 *
     */

    /*.
        require_module 'core';
        require_module 'file';
    .*/

	// Start session to make $_SESSION available
    if(!isset($_SESSION)) session_start();

	define('DS', '/');
	define('__ROOT__', str_replace("\\","/",dirname(__FILE__)));

	require_once(__ROOT__ . '/include/config.inc.php');
	require_once(__ROOT__ . '/include/functions.inc.php');

	// phpinfo();

?>
<!DOCTYPE html>
<html>

<head>
<meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- diables Compatibility Mode on Intranet Sites in DW -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?php echo _LNG('COMPANY'); ?></title>

<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon; charset=binary">

<link href="css/foundation.min.css" type="text/css" rel="stylesheet" />
<link href="css/dropzone.css" type="text/css" rel="stylesheet" />
<link href="css/app.css" type="text/css" rel="stylesheet" />

</head>

<body>

<!-- DRAG AREA (spans whole window height for ease of use)  -->
<form action="" enctype="multipart/form-data" class="dropzone dz-clickable" id="DwDropzone" accept-charset="UTF-8" >

	<div class="container">

		<header class="row expanded appbar" id="appHeader">
			<div id="app-logo" class="column small-12 medium-4 large-3 xlarge-2">
				<a href="/">
					<img title="Zur Startseite" alt="Deutsche Welle - Video File Transfer" src="images/logo_DW.png">
				</a>
			</div>
			<div id="app-title" class="column small-12 medium-8 large-9 xlarge-10">
				<h1><?php echo _LNG('APP_TITLE'); ?></h1>
				<h2><?php echo _LNG('APP_SUBTITLE'); ?></h2>
			</div>
		</header>

		<!-- GLOBAL MESSAGES -->
		<div class="row expanded appbar" id="app-messages"></div>
		<!-- END: GLOBAL MESSAGES -->

		<!-- SENSITIVE AREA -->
		<div class="row expanded" id="app-body" >

				<!-- FIELDSET -->
				<div class="column small-12 medium-6 large-4" id="fieldset" >

					<div class="card" id="app-form">

						<!-- DROPZONE - ADD FILES -->
						<div class="addfile text-center">
							<button class="button clear" type="button" id="btnAddFile" data-abide-ignore>
								<i class="icon icon--plus primary round left seamless"></i>
								<?php echo _LNG('ADD_FILES'); ?>
							</button>

							<div id="selectFile" class="fallback">
								<label for="file" class="button secondary expanded">
									<span class="icon icon--file icon--small"></span>
									<?php echo _LNG('ADD_FILES'); ?>
								</label>
								<input type="file" name="file" id="file" class="show-for-sr" placeholder="<?php echo _LNG('ADD_FILES'); ?>" multiple data-abide-ignore />
							</div>
						</div>
						<!-- END: DROPZONE ADD FILES -->

						<div>
							<!-- DROPZONE DESTINATION -->
							<div class="input-group">
								<span class="input-group-label"><label for="newDestination"><?php echo _LNG('SELECT_DESTINATION'); ?>:</label></span>
								<select name="newDestination" id="newDestination" class="input-group-field" data-abide-ignore>
									<?php
										echo createSelectOptionsFromXml($GLOBALS['configXML']->destinationFolder);
									?>
								</select>
							</div>

							<!-- FORM ACTIONS -->
							<button type="submit" class="button primary expanded" name="dzSubmit" id="dzSubmit" disabled="disabled" ><?php echo _LNG('BUTTON_SUBMIT'); ?></button>

							<button type="reset" class="button secondary expanded" name="reset" id="dzReset" disabled="disabled" ><?php echo _LNG('BUTTON_RESET'); ?></button>

							<!-- FORM LEGEND -->
							<div class="callout secondary">
								<ul id="formSubnotes" class="no-bullet">
									<!-- <p class="requiredNote" id="passwordHelpText"><?php echo _LNG('MANDATORY'); ?></p> -->
									<li><span class="label secondary"><?php echo _LNG('ALLOWED_MAX_SIZE'); ?>:</span> <span class="value" id="allowedMaxSize"></span></li>
									<li><span class="label secondary"><?php echo _LNG('ALLOWED_MIME_TYPES'); ?>:</span>
										<ul>
											<li><span class="label secondary"><?php echo _LNG('ALLOWED_MIME_VIDEO'); ?>:</span> <span class="value" id="allowedMimeVideo"></span></li>
											<li><span class="label secondary"><?php echo _LNG('ALLOWED_MIME_AUDIO'); ?>:</span> <span class="value" id="allowedMimeAudio"></span></li>
											<li><span class="label secondary"><?php echo _LNG('ALLOWED_MIME_IMAGE'); ?>:</span> <span class="value" id="allowedMimeImage"></span></li>
										</ul>
									</li>
									<li><hr></li>
									<li><span class="label"><?php echo _LNG('ALLOWED_MAX_FILES'); ?>:</span> <span class="value" id="allowedMaxFiles"></span><span class="help-text"><?php echo _LNG('ALLOWED_MAX_FILES_NOTE'); ?></span></li>									
								</ul>
							</div>

							<!-- FORM HELP -->
							<div class="text-center"><a href="<?php echo $GLOBALS['configXML']->helpLink ?>" class="helpLink" target="_blank"><i class="icon icon--help icon--small icon--left"></i>Hilfe / Dokumentation</a></div>

						</div>

					</div>

				</div>
				<!-- END: FIELDSET -->

				<!-- DROPZONE SECTION -->
				<div class="column small-12 medium-6 large-8 text-center" >

					<!-- TOTAL UPLOAD PROGRESS -->
					<div class="progress" id="progressTotal" role="progressbar">
						<div class="progress-meter">
							<p class="progress-meter-text"></p>
						</div>
					</div>
					<!-- END: TOTAL UPLOAD PROGRESS -->

					<!-- DROPZONE PREVIEW -->
					<div class="dropzone-previews"></div>
					<!-- END: DROPZONE PREVIEW -->

					<!-- DROPZONE CTA -->
					<div id="clickpanel" class="clickpanel">
						<span class="icon icon--large icon--upload"></span>
						<h2 class="dz-message"><?php echo _LNG('DROPZONE_CTA_MESSAGE'); ?></h2>
					</div>
					<!-- END: DROPZONE CTA -->

				</div>
				<!-- END: DROPZONE SECTION -->
		</div>

		<!-- FOOTER -->
		<footer class="row text-center" id="app-footer">
			<div class="column small-12">
				<?php echo _LNG('FOOTER_NOTE'); ?>
			</div>
		</footer>
		<!-- END: FOOTER -->

	</div>

</form>
<!-- END: DRAG AREA -->

<!-- TEMPLATES -->
<div id="tpl-inputTitle" class="inputTitle" style="display:none;">
	<label for="newFileName"><?php echo _LNG('INPUT_VIDEO_TITLE'); ?>:<em>*</em>
		<input type="text" name="" maxlength="52" placeholder="<?php echo _LNG('INPUT_VIDEO_TITLE'); ?>" pattern="file_title" title="<?php echo _LNG('INPUT_TITLE_VALIDATION'); ?>" required />
		<span class="form-error"><?php echo _LNG('ERROR') . ' ' . _LNG('INPUT_TITLE_VALIDATION') ?></span>
	</label>
	<p class="help-text" ><?php echo _LNG('INPUT_TITLE_VALIDATION') ?></p>
</div>
<!-- END: TEMPLATES -->

<!-- LOADING OVERLAY -->
<div id="app-loading">
	<div class="sp sp-circle"></div>
</div>
<!-- END: LOADING OVERLAY -->


<!-- JAVASCRIPT: VENDOR -->

<!-- vendor: foundation and dependencies -->
<script src="js/vendor/jquery-3.3.1.min.js"></script>
<script src="js/vendor/what-input.js"></script>
<script src="js/vendor/foundation.min.js"></script>

<!-- vendor: dropzone -->
<script src="js/vendor/dropzone.fork.js"></script>

<!-- vendor: frame grab -->
<script src="js/vendor/rsvp.js"></script>
<script src="js/vendor/frame-grab.js"></script>

<!-- JAVASCRIPT: CUSTOM -->
<script src="js/app.js"></script>
<script src="js/chunks.js"></script>
<!-- END: JAVASCRIPTS -->

</body>

</html>
