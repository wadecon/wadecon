var UAParser = require('ua-parser-js');

function checkBrowser( ua, cb){
	var parser = new UAParser();
	var browserName = parser.setUA(ua).getBrowser().name;
	var browserVersion = parser.setUA(ua).getBrowser().version.split(".",1).toString();
	// && browserVersion <= 9
	cb(browserName);
}

module.exports = {
	checkBrowser: checkBrowser
}