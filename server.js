/// <reference path="typings/node/node.d.ts"/>
var express = require("express");
var app = express();

var bodyParser = require("body-parser");
var path = require('path');



require('colors');

set = require('./setting.json');
require('./database.js')(this);

app.set("view engine", "ejs");
app.set("views", __dirname+"/app/views");
app.use( express.static( __dirname + "/public" ));
app.use(bodyParser.urlencoded({ extended: false }));

app.route("/")
	.get(function(req, res){
        Works.findAll().then(function(works, err) {
            if(err) console.error(err);
            else {
				//console.log(works);
                res.render("frontpage.ejs", {works: works});
            }
        });
	});
app.get('/join', function(req, res) {
	res.render('join.ejs')
});
app.post('/join', function(req, res) {
	Users.findOne({
		where: {
			nickname: req.body.nickname
		}
	}).then(function(user) {
		if(!user) {
			Users.create(req.body).then(function(user ,err) {
				if(err) console.error(err);
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
	
})
app.get('/work/:workId', function(req, res){
	var workId = req.params.workId;
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
app.post('/work', function(req, res){
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

app.listen(3000);
console.log("3000번 포트에서 서버 시작".green);
