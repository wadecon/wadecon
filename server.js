/// <reference path="typings/node/node.d.ts"/>
var express = require("express");
var app = express();

// fucking dependencies
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require('express-session');
var path = require('path');
var async = require('async');
var md = require("node-markdown").Markdown;
var fs = require("fs");
var request = require("request");

require('colors');	// for fantastic debug

// setting app -> too dizzy to fuck with
app.use(cookieParser());
app.use(session({ secret: "secret", resave: false, saveUninitialized: false}));

var set = require('./setting.json');

var options = process.argv;
for( var num in options){
	if(options[num] == "--port" || options[num] == "-p"){
		set.port = options[Number(num)+1];
	}
	if(options[num] == "--quiet" || options[num] == "-q"){
		console.log = function(){};
	}
}

app.set("view engine", "ejs");
app.set("views", __dirname+"/app/views");
app.use( express.static( __dirname + "/public" ));
app.use(bodyParser.urlencoded({ extended: false }));

// homemade modules
var dbnotices = require("./dbmodules/dbnotices.js");
var dbusers = require("./dbmodules/dbusers.js");
var dbdislikes = require("./dbmodules/dbdislikes.js");
var dbjoins = require("./dbmodules/dbjoins.js");
var dbworks = require("./dbmodules/dbworks.js");
var dbbadges = require("./dbmodules/dbbadges.js");
var dbbadgemaps = require("./dbmodules/dbbadgemaps.js");
var dblogs = require("./dbmodules/dblogs.js");

var systemMod = require("./systemMod.js");
var redisMod = require("./redisMod.js");
var socketMod = require("./socketMod.js");
socketMod.setIoAsyncRedis(io, async, redisMod);
socketMod.setDBs(dbnotices, dbusers, dbdislikes, dbjoins, dbworks, dbbadgemaps, dbbadgemaps, dblogs);



var auth = require("./auth.js");
auth.init(app);
var passport = auth.getPassport();

require('./database.js')();

// fucking routing
app.get('/auth/fb', passport.authenticate('facebook'));

app.get('/auth/fb/callback',
    passport.authenticate('facebook', {
		successRedirect: '/join',
        failureRedirect: '/loginFail'
	})
);

app.get('/login', function(req, res) {
	res.render("login.ejs", {
		isIntro: true, //메인페이지에서 헤더에 로그인버튼을 보여주지 않는데 사용
		host: set.host,
		user: req.user,
		port: ((set.main)?'':':'+set.port),
		isMember: false
	});
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.route("/")
	.get(auth.checkAuthRegi, function(req, res) {
		try {
			systemMod.checkBrowser(req.headers['user-agent'],function(browserName){
				// && browserVersion <= 9
				if (browserName == 'IE') {
					res.write("<script>window.open('http://www.opera.com/ko/computer');</script>");
					res.write("<script>window.open('https://www.mozilla.org/ko/firefox/new/');</script>");
					res.end("<script>location.href='https://www.google.com/chrome/browser/desktop/index.html';</script>");
				}
			});
			
			async.parallel([
				function(callback) {
					Works.findAll({
						order: ['dislikes', 'DESC']
					}).then(function(works, err) {
			            if(err) callback(err, null);
			            else {
							callback(null, works);
			            }
			        });
				},
				function(callback) {
					Dislikes.findAll().then(function(dislikes, err){
						if(err)	callback(err, null);
						else{
							callback(null, dislikes);
						}
					});
				},
				function(callback) {
					Joins.findAll().then(function(joins, err){
						if(err) callback(err, null);
						else{
							callback(null, joins);
						}
					});
				}
			], function(err, results) {
				if(err) throw err;
				else {
					if(req.user != null) {
						redisMod.setSession(req.user.id, set.expire, req.user, function() { // 널을 반환하므로 받을 필요가 없다
							console.log("세션 설정!!".cyan);
						});
					}
					var works = results[0];
					var dislikes = results[1];
					var joins = results[2];
					dbdislikes.getWorksDislikesNum(works, function(arrWorksDislikesNum) {
						res.render("frontpage.ejs", {
							works: works,
							isMember: req.regiState,
							user: req.user,
							dislikes: dislikes,
							numDislikes: arrWorksDislikesNum,
							joins: joins,
							host: set.host,
							port: ((set.main)?'':':'+set.port)
						});
					});
				}
			});
		} catch(err) {
			handle500(err, req, res);
		}
	});

app.route("/makework")
	.get(auth.checkAuthRegi, function(req, res){
			res.render('makework.ejs', {
				host: set.host,
				isMember: true,
				port: ((set.main)?'':':'+set.port),
				userId: req.user.id,
				user: req.user,
				pageTitle: '공작 모의'
			});
	})
	.post(auth.checkAuthRegi, function(req, res){
		try {
			async.waterfall([
				function(callback) {
					dbworks.createWork( req.body.name, req.body.desc, function(work, err) {
						if(err) throw err;
						else callback(null, work);
					});
				},
				function(work, callback) {
					var data = {
						workId: work.id,
						userId: req.user.id
					};
					dbjoins.joinOwner(null, data, function(join, err) {
						if(err) throw err;
						else callback(null, work);
					})
				},
				function(work, callback) {
					fs.mkdir("./public/workpage/" + work.id, function(err) {
						if(err) callback(err);
						else {
							async.parallel([
								function(cb) {
									fs.writeFileSync("./public/workpage/" + work.id + "/front.html", md(req.body.readme));
									cb(null);
								},
								function(cb) {
									fs.writeFileSync("./public/workpage/" + work.id + "/needs.html", md(req.body.needs));
									cb(null);
								},
								function(cb) {
									fs.writeFileSync("./public/workpage/" + work.id + "/front.md", req.body.readme);
									cb(null);
								},
								function(cb) {
									fs.writeFileSync("./public/workpage/" + work.id + "/needs.md", req.body.needs);
									cb(null);
								},
							], function(err, results) {
								//여긴 에러를 받을 일이 없다. fs에서 오류나면 그냥 catch됨.
								//근데 안된다. 어쩌지
								callback(null, results, work);
							});
						}
					})
				}
			], function(err, result, work){
				if(err) throw err;
				else res.send({code: 201, url: '/work/'+encodeURIComponent(work.name)});
			});
		} catch(err) {
			handle500(err, req, res);
		}
	});

// try catch로 묶을것.
app.route("/join")
	.get(auth.checkAuth, function(req, res) {
		dbusers.searchByFbid(req.user.fbId, function(user, err) {
			if(err) console.error(err);
			else if(user) {
				if(user.nickname == null)
					res.render('join.ejs', {
						pageTitle: '가입',
						user: req.user,
						isMember: false, //예외사항: 항시 거짓
						host: set.host,
						port: ((set.main)?'':':'+set.port),
						isIntro: true
					});
				else res.redirect('/'); //닉네임 이미 등록됨.
			} else {
				res.redirect('/'); //잘못된 접근: 세션은 인증되어 있는데 해당하는 정보가 DB에 없음
			}
		})
	})
	.post(auth.checkAuth, function(req, res) {
		try {
			if(req.body.nickname) {
				dbusers.searchByNickname(req.body.nickname, function(user, err) {
					if(err) throw err;
					else if(!user) { // 가능한 닉네임
						dbusers.searchByFbid(req.user.fbId, function(user, err) {
							if(err) throw err;
							else if(!user){ // 그 세션의 uid에 해당하는 게 등록 안되어있음 (이상한 케이스)
								res.redirect('/login');
							} else {
								// 여기서 검사는 다 끝남
								console.log("유저 생성 :".cyan, user.name);
								res.send("201").end();
								dbusers.changeNickname(user, req.body.nickname, function(user, err) {
									if(err) throw err;
								});
								if((new Date()).getFullYear() === 2015)
									dbbadgemaps.giveBadge(user.id, 2, function(badgemap, err) {
										if(err) throw err;
									})
								dbusers.cacheUserImage(user.picture, user.id, request, fs, function() {
									fs.mkdir('./public/userbios/' + user.id, function(err) {
										if(err) throw err;
										else {
											console.log('이미지 저장')
											passport.authenticate('facebook')
										}
									});
								});
							}
						});
					} else {
						// 이미 존재하는 닉네임
						res.send("409").end();
					}
				})
			} else res.send("400").end();
		} catch(err) {
			handle500(err, req, res);
		}
	});

app.route("/work/:workName")
	.get(auth.inspectRegi, function(req, res) {
		try {
			async.parallel([
				function(callback) {
					if(req.regiState) {
						dbworks.searchByName(req.params.workName, function(work, err) {
							if(err) callback(err);
							else {
								dbjoins.searchById(req.user.id, work.id, function(join, err) {
									if(err) throw callback(err);
									else if(join && join.userId === req.user.id) callback(null, true);
									else callback(null, false);
								});
							}
						});
					} else callback(null, false);
				},
				function(callback) {
					dbworks.getDislikeJoinedUserByName(req.params.workName, dbjoins, dbdislikes, function(err, results) {
						if(err) callback(err);
						else callback(null, results);
					});
				}
			], function(err, results) {
				if(err) throw err;
				else {
					res.render("workpage.ejs", {
						work: results[1][2],
						numDislikes: results[1][1].length,
						members: results[1][0],
						isMember: req.regiState, // 조합원
						isJoined: results[0], // 공작 참여
						host: set.host,
						port: ((set.main)?'':':'+set.port),
						user: (req.regiState)?req.user:null
					});
				}
			});
		} catch(err) {
			handle500(err, req, res);
		}
	})
	.post(auth.checkAuthRegi, function(req, res){
		try {
			var inputData = {};
			async.waterfall([
				function(callback) {
					dbworks.searchByName(req.params.workName, function(work, err) {
						if(err) callback(err)
						else if(work) callback(null, work);
						else callback('그런 공작 없수다');
					});
				},
				function(work, callback) {
					async.parallel([
						function(cb) {
							if(req.body.readme) {
								fs.writeFileSync("./public/workpage/" + work.id + "/front.html", md(req.body.readme));
								inputData.frontboard = "./public/workpage/" + work.id + "/front.html";
							}
							cb(null);
						},
						function(cb) {
							if(req.body.needs) {
								fs.writeFileSync("./public/workpage/" + work.id + "/needs.html", md(req.body.needs));
								inputData.needs = "./public/workpage/" + work.id + "/needs.html";
							}
							cb(null);
						},
						function(cb) {
							if(req.body.readme)
								fs.writeFileSync("./public/workpage/" + work.id + "/front.md", req.body.readme);
							cb(null);
						},
						function(cb) {
							if(req.body.needs)
								fs.writeFileSync("./public/workpage/" + work.id + "/needs.md", req.body.needs);
							cb(null);
						},
					], function(err, results) {
						//여긴 에러를 받을 일이 없다. fs에서 오류나면 그냥 catch됨.
						callback(null, work);
					});
				},
				function(work, callback) {
					dbworks.editWorkInfo(work.id, inputData, function(work, err) {
						if(err) throw err;
						else callback(null, work);
					});
				}
			], function(err, work){
				if(err) throw err;
				else {
					console.log(work.name + " 수정 성공".green);
					res.send('200');
				}
			});
		} catch(err) {
			handle500(err, req, res);
		}
	});

app.route("/user/:userNick")
	.get(auth.inspectRegi, function(req, res){
		dbusers.searchByNickname(req.params.userNick, function(user, err){
			if(err) console.error(err);
			else if(!user) {
				res.status(404).end();
			} else {
				dbbadgemaps.getBadgesOfUser(user.id, function(badges, err) {
					if(err) console.error(err);
					else res.render('userpage.ejs', {
						host: set.host,
						port: ((set.main)?'':':'+set.port),
						pageTitle: '얘의 정보',
						isMember: req.regiState,
						user: req.user,
						object: user,
						badges: badges
					});
				});
			}
		});
	})
	.post(auth.checkAuthRegi, function(req, res){
		try {
			async.parallel([
				function(callback) {
					fs.writeFileSync('./public/userbios/' + req.user.id + '/bio.html', md(req.body.bio));
					callback(null);
				},
				function(callback) {
					fs.writeFileSync('./public/userbios/' + req.user.id + '/bio.md', req.body.bio);
					callback(null);
				}
			], function(err, results) {
				if(err) throw err;
				else {
					dbusers.editInfoByNickname(req.user.nickname, {
						bio: '.public/userbios/' + req.user.nickname + '/bio.html'
					}, function(user, err) {
						if(err) throw err;
						else res.send("200");
					});
				}
			});
		} catch(err) {
			handle500(err, req, res);
		}
	});

app.get('/badge/:badgeName', auth.inspectRegi, function(req, res) {
	try {
		dbbadges.findByName(req.params.badgeName, function(badge, err) {
			if(err) throw err;
			else res.render('badgepage.ejs', {
				isMember: req.regiState,
				user: req.user,
				badge: badge,
				host: set.host,
				port: ((set.main)?'':':'+set.port),
				pageTitle: badge.name
			});
		});
	} catch(err) {
		handle500(err, req, res);	
	}
	
})

// handle 404
function handle404(req, res) {
	res.status(404).sendFile( __dirname+"/public/status/404NF.html");
};

// handle 500
function handle500(error, req, res, next) {
	console.error(error);
	res.status(200).render('error.ejs', {
		host: set.host,
		port: ((set.main)?'':':'+set.port),
		pageTitle: '500',
		isMember: req.regiState,
		user: req.user,
		error: error
	});
};

app.use(handle404);
app.use(handle500);

server.listen(set.port || 8080);
console.log((set.host+":"+(set.port || 8080)).cyan+"에서 서버 시작".green);

dbbadges.createBadge(1, "반동분자", "자기가 참여해놓고 자기가 싫어하는 자아분열 불순 반동분자.", 18, true, function(a, err) {
});
dbbadges.createBadge(2, "원년멤버", "와데콘 첫 해 2015년에 가입한 멤버", -2015, false, function(a, err) {
});