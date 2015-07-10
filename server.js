var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require('express-session');
var path = require('path');
var async = require('async');

require('colors');	// for fantastic debug

var app = express();
var auth = require("./auth.js");
require('./database.js')();
require('./facebook.js')(app);

app.use(cookieParser());
app.use(session({ secret: "secret" }));

app.set("view engine", "ejs");
app.set("views", __dirname+"/app/views");
app.use( express.static( __dirname + "/public" ));
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/loginSuccess', auth.checkAuthState, function(req, res){
	console.log("로그인성공");
    res.send(req.user);
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.route("/")
	.get(function(req, res){
        Works.findAll().then(function(works, err) {
            if(err) console.error(err);
            else {
				//console.log(works);
                res.render("frontpage.ejs", {works: works});
            }
        });
	})
	.post(function(req, res){
		var workId = req.params.workId;
		Works.findOrCreate({
			where: {
				name: req.body.name,
				desc: req.body.desc
			}
		}).then(function(work, err) {
			if(err) console.error(err);
	        else {
				console.log("공작 생성 :".cyan, work.name);
	            res.redirect('/');
	        }
		});
	});

app.route("/join")
	.get(auth.checkAuthState, function(req, res) {
		console.log(req.user.name, req.user.picture)
		res.render('join.ejs', {
			name: req.user.name,
			picture: req.user.picture
		})
	})
	.post(function(req, res) {
		Users.findOne({
			where: {
				nickname: req.body.nickname
			}
		}).then(function(user) {
			if(!user) {
				Users.create(req.body).then(function(user ,err) {
					if(err) {
						console.error(err);
						res.sendStatus(500);
					}
					else {
						console.log("유저 생성 :".cyan, user.name);
						res.sendStatus(201);
					}
				});
			} else {
				// 이미 존재하는 닉네임
				res.status(409)
			}
		})
	});


app.route("/work/:workId/:workName")
	.get(function(req, res){
		var workId = req.params.workId;
		var workName = req.params.workName;
		Works.findOne({
			where: {
				id: workId
			}
		}).then(function(work, err) {
			if(err) console.error(err);
			else {
				console.log("공작 조회 :".cyan, work.name);
				res.render("workpage.ejs", {work: work} );
			}
		});
	})
	.post(function(req, res){
		
	});

app.route("user/:userNick")
	.get(function(req, res){
		var userNick = req.parmas.userNick;
	})
	.post(function(req, res){
		// edit user information
	});

app.listen(3000);
console.log("3000".cyan+"번 포트에서 서버 시작".green);
