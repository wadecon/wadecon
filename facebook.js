module.exports = function(app) {
	var set = require('./setting.json');
	var FB = require('facebook-node');
	var passport = require('passport')
	    , FacebookStrategy = require('passport-facebook').Strategy;
	app.use(passport.initialize());
	app.use(passport.session());
		
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
	        callbackURL: "http://localhost:3000/auth/fb/callback"
	    },
	    function(accessToken, refreshToken, profile, done) {
			console.log("P",profile)
			//console.log(user);
			Users.findOne({
				fbId: profile.id
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
	app.get('/auth/fb', passport.authenticate('facebook'));

	app.get('/auth/fb/callback',
	    passport.authenticate('facebook', {
			successRedirect: '/join',
	        failureRedirect: '/loginFail'
		})
	);
};