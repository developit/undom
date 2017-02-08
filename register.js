if (typeof global!=='undefined' && !global.document) {
	global.window = require('.')().defaultView;
	for (var i in global.window) global[i] = global.window[i];
}
