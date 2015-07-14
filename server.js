/// <reference path="typings/node/node.d.ts"/>
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
var md = require("node-markdown").Markdown;
var fs = require("fs");

require('colors');	// for fantastic debug

// setting app -> too dizzy to fuck with
app.use(cookieParser());
app.use(session({ secret: "secret" }));

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
var dbowns = require("./dbmodules/dbowns.js");

var socketMod = require("./socketMod.js");
var systemMod = require("./systemMod.js");


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

app.route("/")
	.get(auth.inspect, function(req, res) {
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
						console.log(works);
						callback(null, works);
		            }
		        });
			},
			function(callback) {
				Dislikes.findAll().then(function(dislikes, err){
					if(err)	callback(err, null);
					else{
						console.log(dislikes);
						callback(null, dislikes);
					}
				});
			},
			function(callback) {
				Joins.findAll().then(function(joins, err){
					if(err) callback(err, null);
					else{
						console.log(joins);
						callback(null, joins);
					}
				});
			}
		], function(err, results) {
			if(err) console.error(err);
			else{
				var works = results[0];
				var dislikes = results[1];
				var joins = results[2];
				dbdislikes.getWorksDislikesNum(works, function(arrWorksDislikesNum) {
					res.render("frontpage.ejs", {
						works: works,
						login: req.authState,
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
	});

app.route("/makework")
	.get(auth.checkAuthState, function(req, res){
		if(req.authState) {
			res.render('makework.ejs', {
				host: set.host,
				port: ((set.main)?'':':'+set.port),
				userId: req.user.id,
				user: req.user,
				pageTitle: '공작 모의'
			});
		} else {
			res.redirect('/');
		}
	})
	.post(auth.checkAuthState, function(req, res){
		async.waterfall([
			function(cb){
				dbworks.createWork( req.body.name, req.body.desc, function(work, err) {
					if(err) console.error(err);
					else {
						cb( null, work );
					}
				});
			},
			function(work, cb){
				async.parallel([
					function(callback){
						dbowns.createOwn(req.user.id, work.id, function(own, err){
							if(err) console.error(err);
							else{
								console.log("공작 생성 :".cyan, work.name);
								fs.mkdir("./public/workpage/"+work.name, function(err){
									if(err) console.error(err);
						        	else{
										callback(null, {});
									}
								});
							}
						});
					},
					function(callback){
						var data = {
							workId: work.id,
							userId: req.user.id
						};
						dbjoins.toggleTuple( null, data, function(){
							callback(null, {});
						});
					}
				],
				function(err, result){
					cb( null, work );
				});
			},
			function( work, cb){
				async.parallel([
					function(callback) {
						fs.writeFile("./public/workpage/" + work.name + "/front.html", md(req.body.readme), function(err) {
							if(err) callback(err, null);
							else callback(null);
						});
					},
					function(callback) {
						fs.writeFile("./public/workpage/" + work.name + "/needs.html", md(req.body.needs), function(err) {
							if(err) callback(err, null);
							else callback(null);
						});
					}
				], function(err, results) {
					if(err) console.error(err);
					else {
						console.log("공작 생성 리스폰스");
						cb( err, results, work );
					}
				});
			}
		], function(err, result, work){
			res.send({code: 201, url: '/work/'+encodeURIComponent(work.name)});
		});
	});

app.route("/join")
	.get(auth.inspect, function(req, res) {
		console.log("REQ", req.user)
		dbusers.searchByFbid(req.user.fbId, function(user, err) {
			console.log(user);
			if(err) console.error("ERROR".red, err);
			else if(user) {
				if(user.nickname == null)
					res.render('join.ejs', {
						pageTitle: '가입',
						name: req.user.name,
						login: req.authState,
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
		if(req.body.nickname) {
			dbusers.searchByNickname(req.body.nickname, function(user, err) {
				if(err) console.error(err);
				else if(!user) { // 가능한 닉네임
					dbusers.searchByFbid(req.user.fbId, function(user, err) {
						if(err) console.error(err);
						else if(!user){ // 그 세션의 uid에 해당하는 게 등록 안되어있음 (이상한 케이스)
							res.redirect('/');
						} else {
							dbusers.changeNickname(user, req.body.nickname, function(user, err) {
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
			})
		} else res.send("400").end();
	});

app.route("/work/:workName")
	.get(auth.inspect, function(req, res){
		Works.findOne({
			where: {
				name: req.params.workName 
			}
		}).then(function(work, err) {
			if(err) console.error(err);
			else {
				dbdislikes.searchWorksDislikes(work.id, function(result){
					var numDislikes = result.length;
					res.render("workpage.ejs", {
						work: work,
						numDislikes: numDislikes,
						host: set.host,
						port: ((set.main)?'':':'+set.port),
						user: (req.authState)?req.user:null
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
	.get(auth.inspect, function(req, res){
		dbusers.searchByNickname(req.params.userNick, function(user, err){
			if(err) console.error(err);
			else{
				if(req.authState) {
					if( req.params.userNick == req.user.nickname ){
						res.render('userpage.ejs', {
							host: set.host,
							port: ((set.main)?'':':'+set.port),
							pageTitle: '너의 정보',
							login: req.authState,
							user: user
						});
					}else{
						res.render('userpage.ejs', {
							host: set.host,
							port: ((set.main)?'':':'+set.port),
							pageTitle: '얘의 정보',
							user: user
						});
					}
				}else{
					res.redirect('/');
				}
				
			}
		});
	})
	.post(function(req, res){
		// edit user information
	});

// sockets
io.on('connection', function (socket) {
	socketMod.setSocketAndAsync(socket, async);
	socketMod.setDBs(dbnotices, dbusers, dbdislikes, dbjoins, dbworks, dbowns);
	socket.emit('news', {});
	socket.on('namecheck', socketMod.nameCheck);
	socket.on('titlecheck', socketMod.titleCheck);
	socket.on('clientUpdateDislike', socketMod.updateDislike);
	socket.on('clientUpdateJoin', socketMod.updateJoin);
	// socket.on('');
});

// handle 404
app.use(function(req, res) {
	res.status(404).sendFile( __dirname+"/public/status/404NF.html");
});

// handle 500
// app.use(function(error, req, res, next) {
// 	res.status(500).send('500: Internal Server Error\n'+error);
// });

server.listen(set.port || 8080);
console.log((set.host+":"+(set.port || 8080)).cyan+"에서 서버 시작".green);