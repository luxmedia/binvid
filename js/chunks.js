// ----------------------------
// VARIABLES (global)
// ----------------------------
// Text
var msgFormInvalid =        'Es gibt Fehler in einigen Feldern. Bitte prüfen.',
    msgTransferSuccess =    'Dateien wurden erfolgreich übertragen',
    msgTransferCanceled =   'Der Upload wurde abgebrochen',
    msgDuplicatesNotAllowed = 'Die selbe Datei ist bereits in Ihrer Uploadliste',

// App parameters and Options
    isValidForm =           false,
    debugMode =             0,
    preventDuplicates =     1,
    initialProgress =       0, // used to fix issue 690 - https://github.com/enyo/dropzone/issues/690
    minTitleLength =        4,
    maxTitleLength =        52,
    messageHideDelay =      5000, // in ms
	loadingHideDelay =      700, // in ms
	loadingTimer = 			[],
	
// Objects and DOM-elements
    submitButton =          document.querySelector("#dzSubmit"),
    resetButton =           document.querySelector("#dzReset"),
    inputs =                document.querySelectorAll('input:not([type="submit"])'),
    dzId =                  '#DwDropzone',
    formElement =           document.getElementById('DwDropzone'),
    progressTotal =         document.querySelector('#progressTotal'),
    formAbide =             [],
    DwDropzone =            {}, // Dropzone object
    $formObject =           $(); // jQUery Dropzone object

// ----------------------------
// DROPZONE: Avoid automatic initialization of .dropzone
// ----------------------------
if (typeof "Dropzone" != "undefined") {
    Dropzone.options.myAwesomeDropzone = false;
    Dropzone.autoDiscover = false;
}

// ----------------------------
// ASSIGN DOM objects
// ----------------------------
function assignGlobalDomObjects() {
	submitButton =          document.querySelector("#dzSubmit");
    resetButton =           document.querySelector("#dzReset");
    inputs =                document.querySelectorAll('input:not([type="submit"])');
    formElement =           document.getElementById('DwDropzone');
    progressTotal =         document.querySelector('#progressTotal');

    $formObject =       	$(dzId);
    progressTotal.style.display = 'none';	
}

// ----------------------------
// HELPER FUNC: Parse XML String (with IE <=8 fallback)
// ----------------------------
function loadXMLString(xmlString) {
    "use strict";
    // ObjectExists checks if the passed parameter is not null.
    // isString (as the name suggests) checks if the type is a valid string.
    if ((typeof xmlString != "undefined") && (typeof xmlString === 'string' || xmlString instanceof String)) {
        var xDoc;
        var dp;
        // The GetBrowserType function returns a 2-letter code representing
        // ...the type of browser.
        var bType = window.navigator.userAgent;

        switch(bType) {
            case "MSIE":
                // This actually calls into a function that returns a DOMDocument
                // on the basis of the MSXML version installed.
                // Simplified here for illustration.
                xDoc = new ActiveXObject("MSXML2.DOMDocument");
                xDoc.async = false;
                xDoc.loadXML(xmlString);
                break;
            default:
                dp = new DOMParser();
                xDoc = dp.parseFromString(xmlString, "text/xml");
                break;
        }
        return xDoc;
    } else {
        return null;
    }
}

// ----------------------------
// LOAD CONFIG XML
// ----------------------------
function loadConfigXML() {
    "use strict";
    var xml = new XMLHttpRequest();
    xml.open('GET','config.xml',true);
    xml.send(null);

    xml.onreadystatechange = function() {
		// check if xml is fully loaded without error
        if ((this.readyState == 4) && (this.status == 200)) {
            var xmlData = loadXMLString(xml.responseText);
            // debug(xmlData);
            if (xmlData) {
                debugMode = getNodeValue(xmlData, 'debugMode');
				console.log(debugMode);
				initApp(xmlData);
            } else {
				console.log("FUNC: loadCOnfigXML -> xmlData empty : " + xmlData);
			}
			
        } else {
			// do something here, if there is an error
		}
    };
}

// ----------------------------
// HELPER FUNC: Toggle form buttons visibility
// ----------------------------
function enableFormButtons(state) {
    "use strict";
    // Only enable buttons, if a file is put into the dropzone
    if (state) {
        submitButton.classList.remove('is-disabled');
        submitButton.disabled = false;
        resetButton.classList.remove('is-disabled');
        resetButton.disabled = false;
    } else {
        submitButton.classList.add('is-disabled');
        submitButton.disabled = true;
        resetButton.classList.add('is-disabled');
        resetButton.disabled = true;
        // Reflow abide form event listeners
        Foundation.reInit($formObject);

    }
}

// ----------------------------
// HELPER FUNC: Sanitize filename
// ----------------------------
function normalizeFilename(str) {
    "use strict";
    // remove extension
    str = str.replace(/\.[^\/.]+$/, "");
    // Remove any character that is not alphanumeric, white-space, a hyphen or a underscore
    str = str.replace(/([^a-zA-Z0-9\s\-\_])/g, '');
    // Replace all spaces with hyphens
    str = str.replace(/(\s)/g, '-');
    // Replace multiple hyphens with a single hyphen
    str = str.replace(/(\-\-+)/g, '-');
    // Remove leading and trailing hyphens, truncate to maxTitleLength, optional: lowercase
    str = str.trim().substring(0, maxTitleLength); // .toLowerCase();

    debug('FUNC: normalizeFilename ' + str);

    return str;
}

// ----------------------------
// HELPER FUNC: Check if element exceeds boundaries
// ----------------------------
function isOverflown(element, parent) {
    "use strict";
    return element.offsetHeight > parent.offsetHeight || element.offsetWidth > parent.offsetWidth;
}

// ----------------------------
// HELPER FUNC: Convert Bytes to humanreadable format
// ----------------------------
function formatBytes(bytes, decimals) {
    "use strict";
   if(bytes == 0) { return '0 Bytes'; }
   var k = 1024,
       dm = decimals <= 0 ? 0 : decimals || 2,
       sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// ----------------------------
// HELPER FUNC: Create multiple attributes at once
// ----------------------------
function setAttributes(el, attributes) {
    "use strict";
    Object.keys(attributes).forEach(function(name) {
        el.setAttribute(name, attributes[name]);
    });
}

/**
* SHOW/HIDE GLOBAL MESSAGES
* ------------------------------------
* @param string msg
* @param string type
*/
function showMessage(msg, type) {
    "use strict";
    var container = document.getElementById('app-messages'),
        newMwessage = document.createElement('div'),
        prefix = '';

    switch(type) {
        case "alert":
            prefix = "FEHLER";
            break;
        default:
            prefix = "INFO";
            break;
    }

    newMwessage.classList.add('callout', type);
    newMwessage.textContent = prefix + " - " + msg;
    container.appendChild(newMwessage);
    container.style.top = document.getElementById('appHeader').offsetHeight + 'px';
    container.classList.add('is--active');
    window.setTimeout(function(){
        container.removeAttribute("style");
        container.classList.remove('is--active');
        container.lastChild.remove();
    }, messageHideDelay);
}

/**
* SHOW/HIDE GLOBAL MESSAGES
* ------------------------------------
* @param string msg
* @param string type
*/
function toggleLoadingOverlay(state) {
    "use strict";
    var container = document.getElementById('app-loading');

	container.style.height =  window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    if (state) {
		// show loading overlay
		clearTimeout(loadingTimer);
		container.classList.add('is--active');
	} else {
		// delay hide loading overlay
		loadingTimer = window.setTimeout(function(){
			container.classList.remove('is--active');
		}, loadingHideDelay);
	}
}


// ----------------------------
// CREATE VIDEO THUMBNAIL USING frame-grab.js Plugin
// ----------------------------
// http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
// https://github.com/enyo/dropzone/issues/1460
function createVideoThumb(file, dzobject) {
    "use strict";

    var comps = file.name.split(".");
    if (comps.length === 1 || (comps[0] === "" && comps.length === 2)) {
        return;
    }
    var ext = comps.pop().toLowerCase();
    if (ext == 'mov' || ext == 'mpeg' || ext == 'mp4' || ext == 'wmv') {

        // create a hidden <video> element with video file.
        FrameGrab.blob_to_video(file).then(
            function videoRendered(videoEl) {

                // extract video frame at 1 sec into a 160px image and
                // set to the <img> element.
                var frameGrab = new FrameGrab({video: videoEl});
                var imgEl = file.previewElement.querySelector("img");
                frameGrab.grab(imgEl, 1, 160).then(
                    function success(itemEntry) {
                        debug("FUNC: createVideoThumb -> frameGrabbed");
                        // do something here ...
                    },
                    function failure(reason) {
                        debug("FUNC: createVideoThumb - ERROR: Can't grab the video frame from file: " +
                            file.name + ". Reason: " + reason);
                    }
                );
            },
            function videoFailedToRender(reason) {
                debug("FUNC: createVideoThumb - ERROR: Can't convert the file to a video element: " +
                    file.name + ". Reason: " + reason);
            }
        );
    }
}

// ----------------------------
// CREATE HTML INOUT ELEMENT FOR EACH FILE'S TITLE
// ----------------------------
function createFileTitleInput(file) {
    "use strict";
    // Create input field for titlevar
    var prevEl = document.querySelector(".dropzone-previews").lastElementChild,
        _id = file.upload.uuid,
        _fname = normalizeFilename(file.upload.filename),
        _tpl = document.getElementById('tpl-inputTitle'),
        _input = document.createElement("input"); //input element, text

    // Set unique id for each preview-element
    prevEl.setAttribute('id', "preview-" + _id);
    prevEl.querySelector('[data-dz-size]').textContent = formatBytes(file.size); // show more precise file-size, Dropzone default does a lot rounding here ...
    // prevEl.classList.add('column','small-12','medium-6','large-6');

    //console.log(JSON.stringify(file));
    var tplClone = _tpl.cloneNode(true),
        cloneInput = tplClone.querySelector('input');

    setAttributes(cloneInput, {
        //type: 'text',
        name: 'title_' + _id,
        //placeholder: 'Videotitel',
        id: 'title_' + _id,
        value: _fname
        //pattern: 'file_name',
        //maxlength: maxTitleLength
    });

    tplClone.removeAttribute('id');
    tplClone.classList.add('inputTitle');
    tplClone.removeAttribute('style');

    //i.setAttribute('type', 'text');
    //i.setAttribute('name', 'title_' + _id);
    //i.setAttribute('placeholder', 'Videotitel');
    //i.setAttribute('id', 'title_' + _id);
    //i.setAttribute('value', _fname);
    //i.setAttribute('pattern', 'file_name');
    //i.setAttribute('maxlength', maxTitleLength);

    prevEl.querySelector('.dz-details').appendChild(tplClone);
    Foundation.reInit($formObject);
}

// ----------------------------
// HELPER FUNC: Create multiple attributes at once
// ----------------------------
function resetForm() {
    "use strict";
    enableFormButtons(false);
    progressTotal.style.display = 'none';
    progressTotal.querySelector('.progress-meter').style.width = 0;
    progressTotal.querySelector('.progress-meter-text').textContent = '';
}

/**
* Helper function to get boolean of a string
* @param string str
* @return boolean
* @link https://stackoverflow.com/a/21285901
*/
function getBool(str) {
    return !!JSON.parse(String(str).toLowerCase());
}

/**
* Function to do stuff when file has been added to dropzone
* uses async mode, to ensure invoked functions to be finished until proceeding
* @param string str
* @return boolean
*/
async function dzFileAdded(file, dzFiles, dzObj) {
	
	debug('EVENT: addedfile -> file: ' +  JSON.stringify(file));
	toggleLoadingOverlay(true);
	var duplicateFound = false;

	// Duplicate filter
	if (dzFiles.length) {
		var _i,
			_len = dzFiles.length;
		for (_i = 0; _i < _len - 1; _i++) // -1 to exclude current file
		{
			if (preventDuplicates && dzFiles[_i].name === file.name && dzFiles[_i].size === file.size && dzFiles[_i].lastModifiedDate.toString() === file.lastModifiedDate.toString()) {
				showMessage(file.name + " : " + msgDuplicatesNotAllowed, 'alert');
				this.removeFile(file);
				duplicateFound = true;
			}
		}
	}

	if (!duplicateFound) {
		enableFormButtons(true);
		
		// Create an input DOM element for each file
		createFileTitleInput(file);
		
		// CREATE VIDEO THUMBNAIL
		await createVideoThumb(file, this);

	}
	toggleLoadingOverlay(false);
}

/**
* ----------------------------
* CREATE DROPZONE
* ----------------------------
* @param dom-obj dzOptions
*/
function createDropzone(dzOptionsDom) {
	// assign dropzone options from config.xml values
	var _accpetedFiles = getNodeValue(dzOptionsDom, 'acceptedFilesVideo') + ", " + getNodeValue(dzOptionsDom, 'acceptedFilesAudio') + ", " + getNodeValue(dzOptionsDom, 'acceptedFilesImage');
    var dzOptions = {
        url:                    'chunks.php',
        acceptedFiles:          _accpetedFiles, // getNodeValue(dzOptionsDom, 'acceptedFiles'),
        addRemoveLinks:         getBool(getNodeValue(dzOptionsDom, 'addRemoveLinks')), // true,
        autoProcessQueue:       getBool(getNodeValue(dzOptionsDom, 'autoProcessQueue')), // false,
        chunking:               getNodeValue(dzOptionsDom, 'chunking'), // split file upload in smaller parts
        chunkSize:              parseInt(getNodeValue(dzOptionsDom, 'chunkSize')) * 1024 * 1024, // 24*1024*1024, // Chunk size in bytes = 28MB Chunks
        clickable:              '#btnAddFile',
        forceChunking:          getBool(getNodeValue(dzOptionsDom, 'forceChunking')), // true,
        maxFiles:               null, // 1, //Only one File
        maxFilesize:            parseInt(getNodeValue(dzOptionsDom, 'maxFilesize')) * 1024, // 25*1024, // max file size in MB, default 256
        method:                 'POST',
        parallelChunkUploads:   getBool(getNodeValue(dzOptionsDom, 'parallelChunkUploads')), // true,
        parallelUploads:        parseInt(getNodeValue(dzOptionsDom, 'parallelUploads')), // 20, // default: 2
        paramName:              'file', // DOM-element containing the file
        previewsContainer:      '.dropzone-previews',
        // previewTemplate:         document.querySelector('#appPreview').innerHTML,
        retryChunks:            getBool(getNodeValue(dzOptionsDom, 'retryChunks')), // true,
        retryChunksLimit:       parseInt(getNodeValue(dzOptionsDom, 'retryChunksLimit')), // 3,
        uploadMultiple:         getBool(getNodeValue(dzOptionsDom, 'uploadMultiple')), // false, // must be false when chunking is true
        // Dropzone messages:
        dictDefaultMessage:     'Drag or click here to upload file ...',
        dictRemoveFile:         'Datei entfernen',
        dictCancelUpload:       'Upload abbrechen',
        dictCancelUploadConfirmation: 'Bitte bestätigen: Upload wirklich abbrechen?',
        dictInvalidFileType:    'FEHLER: Dieser Dateityp kann nicht verarbeitet werden.'
	};

	// Show some Dropzone option values in form footer
    document.getElementById('allowedMimeVideo').textContent = getNodeValue(dzOptionsDom, 'acceptedFilesVideo');
    document.getElementById('allowedMimeAudio').textContent = getNodeValue(dzOptionsDom, 'acceptedFilesAudio');
	document.getElementById('allowedMimeImage').textContent = getNodeValue(dzOptionsDom, 'acceptedFilesImage');
    document.getElementById('allowedMaxSize').textContent = formatBytes(parseInt(getNodeValue(dzOptionsDom, 'maxFilesize')) * 1024 * 1024 * 1024);
	document.getElementById('allowedMaxFiles').textContent = getNodeValue(dzOptionsDom, 'maxFiles');
	
	preventDuplicates = getBool(getNodeValue(dzOptionsDom, 'preventDuplicates'));

	// Create Dropzone
    DwDropzone = new Dropzone(dzId, dzOptions);
}

Dropzone.options.DwDropzone = {

    init: function() {
        debug('EVENT: init');
        var meDropzone = this; // closure

        // Event Button-Click: First change the button to actually tell Dropzone to process the queue.
        submitButton.addEventListener("click", function(e) {
            debug('submit ...');
            e.preventDefault(); // stop form from sending
            e.stopPropagation();

            // Validate form with foundation-abide
            $formObject.foundation('validateForm');

            // If form is valid, process files
            if (isValidForm && (meDropzone.files != "")) {
                debug('meDropzone.processQueue() --> files: ' + meDropzone.files);
                // Upload files and submit form
                meDropzone.processQueue();
            } else {
                showMessage(msgFormInvalid, 'alert');
                debug(isValidForm);
            }

        });

        // Event Button-Click: Clear Dropzone
        resetButton.addEventListener("click", function(e) {
            debug('EVENT: resetButton : Click');
            meDropzone.removeAllFiles(true);
            resetForm();
        });

        // Event: sending
        this.on("sending", function(file, xhr, formData) {
            if (debugMode) {
                console.log('EVENT: sending');
                console.log(formData);
                console.log(xhr);
                // console.log('EVENT: sending -> file: ' + JSON.stringify(file.upload));
            }

            // TEMP: Fix for missing dropzone form data, which should normally be transmitted through params-function
            // $.each(file.upload, function(name,value) {
            //  var _key = 'dz'+name.toString().toLowerCase();
            //  formData.append(_key,value);
            // });
            formData.append("filesize", file.size);
            progressTotal.style.display = 'block';
        });

        // Event: addedfile
        this.on("addedfile", function(file) {
			
			var dzFiles = this.files;
			dzFileAdded(file, dzFiles, this);

        });

        // File upload Progress
        this.on("totaluploadprogress", function (uploadProgress, totalBytes, totalBytesSent) {
            //debug("EVENT: totaluploadprogress -> uploadProgress: ", uploadProgress);
            progressTotal.querySelector('.progress-meter').style.width = uploadProgress + "%";
            progressTotal.querySelector('.progress-meter-text').textContent = Math.round(uploadProgress) + " %" + " (" + formatBytes(totalBytes) + ")";
        });

        // File upload Progress
        this.on("uploadprogress", function (file, progress, bytesSent) {
            //debug("EVENT: uploadprogress -> file.name: " + file.name + ", progress: ", progress);

            if (file.previewElement) {
				// Show and animate progress-bar
                var _el = file.previewElement.querySelector("[data-dz-uploadprogress]"),
                    _content = Math.round(progress) + " %" + " (" + formatBytes(bytesSent) + ")";

                if (!_el.querySelector('.progress-meter-text')) {
                    var _meterText = document.createElement('p');
                    _meterText.classList.add('progress-meter-text');
                    _meterText.textContent = _content;
                    _el.appendChild(_meterText);
                } else {
                    _el.querySelector('.progress-meter-text').textContent = _content;
                }

                if (isOverflown(_el.querySelector('.progress-meter-text'), _el)) {
                    _el.querySelector('.progress-meter-text').classList.add('is--overflowing');
                } else {
                    _el.querySelector('.progress-meter-text').classList.remove('is--overflowing');
                }
            }

        });

        // this.on("queuecomplete", function (progress) {
        //  debug('queuecomplete ', progress);
        //  progressTotal.style.height = "0";
        // });

        // Event: maxfilesexceeded
        this.on("maxfilesexceeded", function(file){
            debug('EVENT: maxfilesexceeded');
            alert("No more files please!");
            //this.removeAllFiles();
        });

        // Listen to the sendingmultiple event. In this case, it's the sendingmultiple event instead
        // of the sending event because uploadMultiple is set to true.
        this.on("sendingmultiple", function() {
            debug('EVENT: sendingmultiple');
            // Gets triggered when the form is actually being sent.
            // Hide the success button or the complete form.
        });

        this.on("successmultiple", function(files, response) {
            debug('EVENT: successmultiple');
            // Gets triggered when the files have successfully been sent.
            // Redirect user or notify of success.
        });

        this.on("success", function(files, response) {
            debug('EVENT: success');
            showMessage(msgTransferSuccess, 'success');
        });

        this.on("canceled", function(file) {
            debug('EVENT: canceled -->' + file);
            showMessage(file.name + ': ' + msgTransferCanceled, 'alert');

            // var form = new FormData();
            // form.append("file", file);
            // form.append("method", 'cleanup');
            // var xhr = new XMLHttpRequest();
            // xhr.open("POST", chunkScript);
            // xhr.send(form);
            // xhr.onload = function () {
            //    console.log(xhr.responseText); // Der zurückgegebene Text
            //    showimages (xhr.responseText); // Die Daten einspielen
            // }

            // xhr.onerror = function () {
            //    console.log("Ein Fehler ist aufgetreten");
            // }


        });

        this.on("error", function(files, response) {
            debug('EVENT: error');
            showMessage(response, 'alert');
        });

        this.on("errormultiple", function(files, response) {
            debug('EVENT: errormultiple');
            // Gets triggered when there was an error sending the files.
            // Maybe show form again, and notify user of error
        });

        this.on("dragstart", function(event) {
            debug("EVENT: dragstart: " + event);
            // Gets triggered when the files have successfully been sent.
            // Redirect user or notify of success.
        });

    },

    // Event: sending
    // sending: function(file, xhr, formData) {
    //  debug('EVENT: sending');
    //  debug('EVENT: sending -> fromData: ' + JSON.stringify(formData));
    //  debug('EVENT: sending -> xhr: ' + JSON.stringify(xhr));
    //  // debug('EVENT: sending -> file: ' + file);
    //  // $.each(params, function(nm,vl) {
    //  //  formData.append(nm,vl);
    //  // });
    //  formData.append("filesize", file.size);
    //  formData.append("dzuuid", file.upload.uuid);
    //  progressTotal.style.display = 'block';
    // },
    params: function params(files, xhr, chunk) {
        "use strict";
        if(chunk) {
            return {
                dzuuid: chunk.file.upload.uuid,
                dzchunkindex: chunk.index,
                dztotalfilesize: chunk.file.size,
                dzchunksize: this.options.chunkSize,
                dztotalchunkcount: chunk.file.upload.totalChunkCount,
                dzchunkbyteoffset: chunk.index * this.options.chunkSize
            };
        } else {
            console.log("FUNC: params -> no chunk!!!, files: " + JSON.stringify(files));
        }
    },

    // DZ FUNCTIONS
    chunksUploaded: function(file, done) {
        "use strict";
        debug("EVENT: chunksUploaded --> " + file);
        done();
    },

    accept: function(file, done) {
        "use strict";
        debug("EVENT: Accept: uploaded");
        done();
    },

    // Event: maxfilesexceeded
    thumbnail: function(file, dataUrl) {
        "use strict";
        // Display the image in your file.previewElement
        debug('EVENT: thumbnail');
    }

};

/**
* Initialize application
* @param dom-object xmlData
*/
function initApp(xmlData) {
	
	// ----------------------------
    // CREATE DROPZONE
    // ----------------------------
    createDropzone(xmlData.getElementsByTagName('dropzone')[0]);

    // ----------------------------
    // FORM VALIDATION
    // ----------------------------
    // Create foundation Abide object
    formAbide = new Foundation.Abide($formObject,
        {
            live_validate : true, // validate the form as you go
            validate_on_blur : true, // validate whenever you focus/blur on an input field
            focus_on_invalid : true, // automatically bring the focus to an invalid input field
            error_labels: true, // labels with a for="inputId" will recieve an `error` class
            timeout : 200, // the amount of time Abide will take before it validates the form (in ms). smaller time will result in faster validation
            patterns: {
                file_title: /\b^[a-zA-Z0-9\-_]{4,52}\b$/ // Filenames: alphanumeric and 4 to 52 characters only
            }
        }
    );

    // Form validation (abide) events
    $(document).bind("forminvalid.zf.abide", function(ev, frm) {
        // form validation failed
        var invalid_fields = $(this).find('[data-invalid]');

        debug("Form id " + ev.target.id + " is invalid");
        debug(invalid_fields);

        isValidForm = false;
        //enableFormButtons(false);
    })
    .bind("formvalid.zf.abide", function(ev, frm) {
        // form validation passed
        debug("Form id " + frm.attr('id') + " is valid");

        isValidForm = true;
        //enableFormButtons(true);
    });
	
}

/**
* Shorthand function to return value of given DOM-node
* @param dom-object obj - dom object
* @param string nName - node name
* @return string
* TODO: Fallback to "default" if "value" is empty
*/
function getNodeValue(obj, nName) {
	var val = (obj.getElementsByTagName(nName)[0]) ? obj.getElementsByTagName(nName)[0].getElementsByTagName('value')[0].childNodes[0].nodeValue : '';
	debug("getNodeValue -> " + nName + ": " + val);
	return val;
}


// ----------------------------
// DOMREADY
// ----------------------------

// document.addEventListener("DOMContentLoaded", function(event) {
$(document).ready(function() {
    "use strict";

    // LOAD CONFIG XML
    loadConfigXML();
	
    // ASSIGN GLOBAL DOM OBJECTS
    assignGlobalDomObjects();

});
