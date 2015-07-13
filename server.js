var express = require("express");
var app = express();

// fucking dependencies
var server = require('http').Server(app)
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require('express-session');
var path = require('path');
var async = require('async');
var UAParser = require('ua-parser-js');
var md = require("node-markdown").Markdown;
var fs = require("fs");

require('colors');	// for fantastic debug

// setting app -> too dizzy to fuck with
app.use(cookieParser());
app.use(session({ secret: "secret" }));

var set = require('./setting.json');

var options = process.argv;
for( num in options){
	if(options[num] == "--port" || options[num] == "-p"){
		set.port = options[Number(num)+1];
	}
}

app.set("view engine", "ejs");
app.set("views", __dirname+"/app/views");
app.use( express.static( __dirname + "/public" ));
app.use(bodyParser.urlencoded({ extended: false }));

// homemade modules
var dbnotices = require("./dbmodules/dbnotices.js");
var dbusers = require("./dbmodules/dbusers.js");
var dbdislike = require("./dbmodules/dbdislike.js");
var dbjoins = require("./dbmodules/dbjoins.js");

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

app.get('/loginSuccess', auth.checkAuthState, function(req, res){
	console.log("로그인성공");
    res.send(req.user);
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});
app.get('/makework', function(req, res){
	res.render('makework.ejs', {
		pageTitle: '공작 모의'
	})
})
app.route("/")
	.get(auth.inspect, function(req, res){
		var parser = new UAParser();
		var ua = req.headers['user-agent'];
		var browserName = parser.setUA(ua).getBrowser().name;
		var browserVersion = parser.setUA(ua).getBrowser().version.split(".",1).toString();
		// && browserVersion <= 9
		if (browserName == 'IE') {
			res.write("<script>window.open('http://www.opera.com/ko/computer');</script>");
			res.write("<script>window.open('https://www.mozilla.org/ko/firefox/new/');</script>");
			res.end("<script>location.href='https://www.google.com/chrome/browser/desktop/index.html';</script>");
		}

		async.waterfall([
			function(cb){
				Works.findAll().then(function(works, err) {
		            if(err) console.error(err);
		            else {
						cb(null, works);
		            }
		        });
			},
			function(works, cb){
				Dislike.findAll().then(function(dislike, err){
					if(err)	console.error(err);
					else{
						cb(null, works, dislike);
					}
				});
			},
			function(works, dislike, cb){
				Joins.findAll().then(function(joins, err){
					if(err) console.error(err);
					else{
						cb(works, dislike, joins);
					}
				});
			}
		],
		function(works, dislike, joins){
			dbdislike.getWorksDislikeNum(works, function( arrWorksDislikeNum ){
				res.render("frontpage.ejs", {
					works: works,
					login: req.authState,
					user: req.user,
					dislike: dislike,
					numDislike: arrWorksDislikeNum,
					joins: joins,
					host: set.host,
					port: ((set.main)?'':':'+set.port),
				});
			});
		});
        
	});
			
	//작업중
app.post('/makework', auth.checkAuthState, function(req, res){
	var workId = req.params.workId;
	Works.create({
			name: req.body.name,
			desc: req.body.desc
	}).then(function(work, err) {
		if(err) console.error(err);
		else {
			console.log("공작 생성 :".cyan, work.name);
			fs.mkdir("./public/workpage/"+work.name, function(err){
				if(err) console.error(err);
	        	else async.parallel([
					function(callback) {
						fs.writeFile("./public/workpage/" + work.name + "/front.html", req.body.readme, function(err) {
							if(err) callback(err, null);
							else callback(null);
						});
					},
					function(callback) {
						fs.writeFile("./public/workpage/" + work.name + "/needs.html", req.body.needs, function(err) {
							if(err) callback(err, null);
							else callback(null);
						});
					}
				], function(err, results) {
					if(err) console.error(err);
					else {
						console.log("공작 생성 리스폰스");
						res.send({code: 201, url: '/work/'+encodeURIComponent(work.name)});
					}
				});
			});
		}
	});
});

app.route("/join")
	.get(auth.checkAuthState, function(req, res) {
		console.log("REQ", req.user)
		Users.findOne({
			where: {
				"fbId": req.user.fbId
			}
		}).then(function(user, err) {
			console.log(user);
			if(err) console.error("ERROR".red, err);
			else if(user) {
				if(user.nickname == null)
					res.render('join.ejs', {
						pageTitle: '가입',
						name: req.user.name,
						picture: req.user.picture,
						host: set.host,
						port: ((set.main)?'':':'+set.port)
					});
				else res.redirect('/'); //닉네임 이미 등록됨.
			} else {
				res.redirect('/'); //잘못된 접근: 세션은 인증되어 있는데 해당하는 정보가 DB에 없음
			}
		})
	})
	.post(auth.checkAuthState, function(req, res) {
		console.log(req.body);
		if(req.body.nickname) {
			Users.findOne({ // 해당 닉네임 있는지 확인
				where: {
					nickname: req.body.nickname
			}}).then(function(user, err) {
				if(err) console.error(err);
				else if(!user) { // 가능한 닉네임
					Users.findOne({
						fbId: req.user.fbId, // 현재 세션의 페이스북 uid로 찾는다
					}).then(function(user, err) {
						if(err) console.error(err);
						else if(!user){ // 그 세션의 uid에 해당하는 게 등록 안되어있음 (이상한 케이스)
							res.redirect('/');
						} else {
							user.updateAttributes({ // 찾은 유저정보에서 닉네임을 받은 닉네임으로 바꿔준다
								nickname: req.body.nickname
							}).then(function(user, err) {
								if(err) {
									console.error(err);
									res.send("500").end();
								}
								else {
									console.log("유저 생성 :".cyan, user.name);
									res.send("201").end();
								}
							});
						}
					});
				} else {
					// 이미 존재하는 닉네임
					res.send("409").end();
				}
			});
		} else res.send("400").end();
	});

app.route("/work/:workName")
	.get(function(req, res){
		Works.findOne({
			where: {
				name: req.params.workName 
			}
		}).then(function(work, err) {
			if(err) console.error(err);
			else {
				dbdislike.getWorkDislikeNum(work.id, function(numDislike){
					res.render("workpage.ejs", {
						work: work,
						numDislike: numDislike
					});
				});
			}
		});
	})
	.post(function(req, res){
		var workId = req.params.workId;
		Works.findOne({
			where: {
				id: workId
			}
		}).then(function(work, err) {
			if(err) console.error(err);
			else {
				fs.mkdir("./WorkPage/"+work.name, function(err){
					console.log(err);
					if (req.body.reqType == "md") {
						var html = md(req.body.md);
						fs.writeFile("./WorkPage/"+work.name+"/front.html", html, function(err){
							if(err) console.log(err);
							work.updateAttributes({
								frontboard: "./WorkPage" + work.name + "/front.html"
							}).then(function(work, err){
								if(err) console.log(err);
								res.redirect("/work/"+work.id+"/"+work.name);	
							});
						});
					}
					else if ( req.body.reqType == "need" ) {
						var html = md(req.body.need)
						fs.writeFile("./WorkPage/"+work.name+"/need.html", html, function(err){
							if(err) console.log(err);
							work.updateAttributes({
								needs: "./WorkPage" + work.name + "/need.html"
							}).then(function(work, err){
								if(err) console.log(err);
								res.redirect("/work/"+work.id+"/"+work.name);	
							});
						});
					} 
				});
			}
		});
	});

app.route("/user/:userNick")
	.get(function(req, res){
		var userNick = req.parmas.userNick;
	})
	.post(function(req, res){
		// edit user information
	});

// sockets
io.on('connection', function (socket) {
	socket.on('namecheck', function (data) {
		console.log(data);
		if(data) {
			users.searchByNickname(data, function(user, err) {
				if(err) console.error(err);
				else if(!user) { // 가능한 닉네임
					socket.emit('namechecked', true);
				} else { // 이미 존재하는 닉네임
					socket.emit('namechecked', false);
				}
			});
		} else socket.emit('namechecked', false);
	});
	
	socket.on('client_update_dislike',function(data){
		async.waterfall([
			function(cb){
				dbdislike.searchById(data.userId, data.workId, function(dislike, err) {
					if(err) console.log(err);
					else{
						cb(null, dislike);
					}
				});
			},
			function( dislike, cb ){
				dbdislike.toggleTuple(dislike, data, function(){
					cb();
				});
			}
		],
		function(err, result){
			dbdislike.searchUsersDislike(data.userId, function(result){
				socket.broadcast.emit('server_update',result);
				socket.emit('server_update',result);
			});
		});
	});
	socket.on('client_update_joins', function(data){
		async.waterfall([
			function(cb){
				dbjoins.searchById(data.userId, data.workId, function(joins, err){
					if(err) console.log(err);
					else{
						cb(null, joins);
					}
				})
			},
			function(joins, cb){
				dbjoins.toggleTuple(joins, data, function(){
					cb();
				});
			}
		],
		function(err, result){
			dbjoins.searchUsersJoin(data.userId, function(result){
				socket.broadcast.emit('server_update',result);
				socket.emit('server_update',result);
			});
		});
	});
});


server.listen(set.port || 8080);
console.log((set.host+":"+(set.port || 8080)).cyan+"에서 서버 시작".green);
