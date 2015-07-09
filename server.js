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
                res.render("frontpage.ejs", {groups: works});
            }
        });
	})
	.post(function(req, res){
		var data = {
			group_name : req.body.group_name,
			purpose : req.body.purpose
		};
		Works.create({
			name: req.body.group_name,
			desc: req.body.purpose
		}).then(function(work, err) {
			if(err) console.error(err);
            else {
                res.redirect('/');
            }
		});
	});

app.route(/\/group\/.*/)
	.get(function(req, res){
		var group_name = req.path.split("/").slice(-1)[0];
		// connection.query("select * from groups where group_name='"+group_name+"' limit 1",function(err, rows){
	    //     if (err) {
	    //         console.error(err);
	    //         throw err;
	    //     }
		// 	console.log(rows);
		// 	res.render("grouppage.ejs", {groups: rows} );
	    // });
		
	})
	.post(function(req, res){
		// create group
	});

app.listen(3000);
console.log("3000번 포트에서 서버 시작".green);
