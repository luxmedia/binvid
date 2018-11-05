//  DEBUG
function debug(msg,info){
	debugMode && window.console && window.console.log && (info ? window.console.log(info+": ",msg) : window.console.log(msg))
}

//  ZURB FOUNDATION: Custom abide pattern
// NOTE/DEPRECATED: Foudnation Abide form validation is created manually in chunks.js when dom is ready
// Foundation.Abide.defaults.patterns['file_title'] = /^[a-zA-Z0-9]{4,52}$/;
// Foundation.Abide.defaults.patterns['file_title'] = /\b^[a-zA-Z0-9-_]{4,52}\b$/;

//  INIT ZURB FOUNDATION
$(document).foundation();