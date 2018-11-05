// const configXml = 			[];

// ----------------------------
// VARIABLES (global)
// ----------------------------
// Text
const message = 				"Drag or click here to upload file ...",
	lblRemoveFile = 		"Datei entfernen",
	lblCancelUpload = 		"Upload abbrechen",
	lblCancelUploadConfirmation = "Bitte bestätigen: Upload wirklich abbrechen?",
	msgFormInvalid =		"Es gibt Fehler in einigen Feldern. Bitte prüfen.",
	msgTransferSuccess =	"Dateien wurden erfolgreich übertragen",
	msgTransferCanceled = 	'Der Upload wurde abgebrochen',
	msgInvalidFileType =	'FEHLER: Dieser Dateityp kann nicht verarbeitet werden.',
	msgDuplicatesNotAllowed = 'INFO: Die selbe Datei ist bereits in Ihrer Uploadliste';
	
// Parameters and Options
const debugMode = 			1,
	preventDuplicates = 	1,
	addRemoveLinks = 		true,
	autoProcessQueue =		false,
	allowedFileTypes = 		'.mpg,.m2t,.m2p,.mpeg,.mts,.m2v,.mov,.mp4,.wmv,.vob,.mxf,.wav,.aif,.mp3,.mp2,.m4a',
	chunkScript = 			'chunks.php',
	chunkSize = 			24*1024*1024, // Chunk size in bytes = 28MB Chunks
	chunking = 				true,
	forceChunking = 		false,	
	parallelChunkUploads = 	false,	
	maxFiles =				null, // 1, //Only one File
	maxFilesize = 			50*1024, // max file size in MB, default 256
	paramName = 			'file', // DOM-element containing the file
	parallelUploads = 		20, // default: 2
	previewsContainer = 	'.dropzone-previews',
	retryChunks = 			true,
	retryChunksLimit = 		3,
	uploadMultiple = 		false, // must be false when chunking is true	
	initialProgress = 		0; // used tro fix issue 690 - https://github.com/enyo/dropzone/issues/690
	minTitleLength = 		4,
	maxTitleLength = 		52,
	videoFormats = 			'.mpg, .m2t, .m2p, .mpeg, .mts, .m2v, .mov, .mp4, .wmv, .vob, .mxf',
	audioFormats = 			'.wav, .aif, .mp3, .mp2, .m4a',
	messageHideDelay = 		5000; // in ms	

// Create some global variables for DOM-elements
var isValidForm =			false,
	submitButton = 			document.querySelector("#dzSubmit"),
	resetButton = 			document.querySelector("#dzReset"),
	dzClickableElement =	'#btnAddFile',
	inputs = 				document.querySelectorAll('input:not([type="submit"])'),
	formElement = 			document.getElementById('my-awesome-dropzone'),
	$formObject = 			$(),
	progressTotal = 		document.querySelector('#progressTotal'),
	formAbide = 			[];

var DWLoadConfig = DWLoadConfig || (function() {
	
	var _args = {},
		_me = this; // private

    return {
        init : function(Args) {
            _args = Args;
			_me = this;
        },	
		// ----------------------------
		// HELPER FUNC: Parse XML String (with IE <=8 fallback)
		// ----------------------------
		loadXMLString : function(xmlString) {
			// ObjectExists checks if the passed parameter is not null.
			// isString (as the name suggests) checks if the type is a valid string.
			if ((typeof xmlString != "undefined") && (typeof xmlString === 'string' || xmlString instanceof String)) {
				var xDoc;
				// The GetBrowserType function returns a 2-letter code representing
				// ...the type of browser.
				var bType = window.navigator.userAgent;

				switch(bType) {
					case "MSIE":
						// This actually calls into a function that returns a DOMDocument 
						// on the basis of the MSXML version installed.
						// Simplified here for illustration.
						xDoc = new ActiveXObject("MSXML2.DOMDocument")
						xDoc.async = false;
						xDoc.loadXML(xmlString);
						break;
					default:
						var dp = new DOMParser();
						xDoc = dp.parseFromString(xmlString, "text/xml");
						break;
				}
				return xDoc;
			} else {
				return null;
			}
		},

		// ----------------------------
		// LOAD CONFIG XML
		// ----------------------------
		readConfigXML : function() {
			var xml = new XMLHttpRequest();
			xml.open('GET','config.xml', true);
			xml.send(null);

			xml.onreadystatechange = function() {
				
				if ((this.readyState == 4) && (this.status == 200)) {
					//return _me.loadXMLString(xml.responseText);
				} else {
					if (debugMode) console.log("FUNC: readConfigXML --> xhttp state: " + this.readyState + " -- status: " + this.status);
				}
				//console.log(xmlData);
				// if(xmlData) {
					// var dzConfig = xmlData.getElementsByTagName('dropzone');
					// var debugMode = dzConfig[0].getElementsByTagName('debug_mode')[0].firstChild.data;
					// console.log(dzConfig.documentElement.nodeName);
				// }		
			};
		}
	};
}());