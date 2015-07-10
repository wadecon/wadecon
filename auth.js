module.exports = {
	checkAuthState : function(req, res, next) {
		console.log("auth check");
	    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
	    if (req.isAuthenticated()) { return next(); }
	    // 로그인이 안되어 있으면, login 페이지로 진행
		else {
			console.log("not logged");
			res.redirect('/');
		}
	}
};
	