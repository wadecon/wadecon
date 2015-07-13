var set = require('./setting.json');
var FB = require('facebook-node');
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;

function init(app) {
	app.use(passport.initialize());
	app.use(passport.session());
};

function getPassport(){
	// serialize
	// 인증후 사용자 정보를 세션에 저장
	passport.serializeUser(function(user, done) {
	    console.log('serialize', user);
	    done(null, user);
	});
	// deserialize
	// 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
	passport.deserializeUser(function(user, done) {
	    //findById(id, function (err, user) {
	    console.log('deserialize', user);
	    done(null, user);
	    //});
	});
	passport.use(new FacebookStrategy({
	        clientID: '1610016475924040',
	        clientSecret: set.fb.secret,
	        callbackURL: ("http://"+set.host+((set.main)?'':':'+set.port)+"/auth/fb/callback")
	    },
	    function(accessToken, refreshToken, profile, done) {
			console.log("P",profile)
			//console.log(user);
			Users.findOne({
                where: {fbId: profile.id}
			}).then(function(user, err) {
				console.log("USER?".red, user)
				if(err) {
					
				} else if(!user) { // 해당 액세스토큰을 가진 유저가 DB에 없음
					console.log("no user")
					Users.create({
						fbId: profile.id,
						fbToken: accessToken,
						name: profile.displayName,
						picture: 'https://graph.facebook.com/v2.4/'+profile.id+'/picture'
					}).then(function(user, err) {
						console.log(user);
						return done(null, user);
					});
				} else {
					console.log("user is")
					return done(null, user);
				}
			});
	    }
	));
	return passport;
}

function checkAuthState(req, res, next) {
	console.log("auth check", req.user);
    // 로그인이 되어 있으면, 다음 파이프라인으로 진행
    if (req.isAuthenticated()) { return next(); }
    // 로그인이 안되어 있으면, login 페이지로 진행
	else {
		console.log("not logged");
		res.redirect('/');
	}
}

function inspect(req, res, next) {
    req.authState = req.isAuthenticated();
    if(req.authState) {
        Users.findOne({
            where: {
                nickname: req.user.nickname
        }}).then(function(user, err) {
            if(err) console.log(err);
            else if(user) return next();
            else res.redirect('/join');
        });
    } else return next();
}

module.exports = {
	init: init,
	getPassport: getPassport,
	checkAuthState: checkAuthState,
    inspect: inspect
}