/// <reference path="typings/node/node.d.ts"/>
var express = require("express");
var app = express();
var mysql = require("mysql");
var bodyParser = require("body-parser");
var path = require('path');
require('colors');

app.set("view engine", "ejs");
app.set("views", __dirname+"/app/views");
app.use( express.static( __dirname + "/public" ));
app.use(bodyParser.urlencoded({ extended: false }));

var connection = mysql.createConnection({
    host :'localhost',
    port : 3306,
    user : 'root',
    password : '321654',
    database:'wadecon'
});

connection.connect(function(err){
	if (err) {
	    console.error('error connecting: ' + err.stack);
	    return;
  	}
 	console.log('connected as id ' + connection.threadId);
});

app.route("/")
	.get(function(req, res){
		connection.query("select * from groups",function(err, rows){
			if (err) {
				console.error(err);
				throw err;
			}
			res.render( "frontpage.ejs", {groups: rows} );
		});
	})
	.post(function(req, res){
		var data = {
			group_name : req.body.group_name,
			purpose : req.body.purpose
		};
		connection.query("insert into groups SET ?", data,function(err, rows){
	        if (err) {
	            console.error(err);
	            throw err;
	        }
			res.redirect("/");
	    });
	});

app.route(/\/group\/.*/)
	.get(function(req, res){
		var group_name = req.path.split("/").slice(-1)[0];
		connection.query("select * from groups where group_name='"+group_name+"' limit 1",function(err, rows){
	        if (err) {
	            console.error(err);
	            throw err;
	        }
			console.log(rows);
			res.render("grouppage.ejs", {groups: rows} );
	    });
		
	})
	.post(function(req, res){
		// create group
	});

app.listen(3000);
console.log("3000번 포트에서 서버 시작".green);
