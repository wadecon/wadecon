
function checkBrowser(cb){
	var parser = new UAParser();
	var ua = req.headers['user-agent'];
	var browserName = parser.setUA(ua).getBrowser().name;
	var browserVersion = parser.setUA(ua).getBrowser().version.split(".",1).toString();
	// && browserVersion <= 9
	if (browserName == 'IE') {
		cb();
	}
}

module.exports = {
	checkBrowser: checkBrowser
}