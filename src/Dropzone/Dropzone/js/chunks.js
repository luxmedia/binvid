var message = "Test Message"
var paramName = "param"

Dropzone.options.myAwesomeDropzone = {
  url: 'chunks.php',
  maxFiles: 1, //Only one File
  chunking: true,
  chunkSize: 28*1024*1024, // 28 MB Chunks
  forceChunking: false,
  parallelChunkUploads: false,
  retryChunks: true,
  retryChunksLimit: 3,
  dictDefaultMessage: message,
  paramName: paramName,
  autoProcessQueue: false,
  maxFilesize: 256000,

  
  // FUNCTIONS
  chunksUploaded: 
  function(big_file, done_func){
      done_func();
  },
  
  accept: function(file, done) {
    console.log("uploaded");
    done();
  },
  
  init: function() {
	
	var submitButton = document.querySelector("#submit-all") //Button
    myDropzone = this; // closure

    // First change the button to actually tell Dropzone to process the queue.
    this.element.querySelector("button[type=submit]").addEventListener("click", function(e) {
      // Make sure that the form isn't actually being sent.
      e.preventDefault();
      e.stopPropagation();
      myDropzone.processQueue();
    });

	this.on("sending", function(file, xhr, formData) {
      console.log(formData)
    });
	
    // You might want to show the submit button only when 
    // files are dropped here:
    this.on("addedfile", function() {
      // Show submit button here and/or inform user to click it.
    });
  
    this.on("maxfilesexceeded", function(file){
        alert("No more files please!");
		//this.removeAllFiles();
    });
	
	// Listen to the sendingmultiple event. In this case, it's the sendingmultiple event instead
    // of the sending event because uploadMultiple is set to true.
    this.on("sendingmultiple", function() {
      // Gets triggered when the form is actually being sent.
      // Hide the success button or the complete form.
    });
    this.on("successmultiple", function(files, response) {
      // Gets triggered when the files have successfully been sent.
      // Redirect user or notify of success.
    });
    this.on("errormultiple", function(files, response) {
      // Gets triggered when there was an error sending the files.
      // Maybe show form again, and notify user of error
    });
	
	}
}
