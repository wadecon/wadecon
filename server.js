/// <reference path="typings/node/node.d.ts"/>
var express = require("express");
var app = express();
var path = require('path');
require('colors');

app.set("view engine", "ejs");
app.set("views", __dirname+"/app/views");
app.use( express.static( __dirname + "/public" ));

app.route("/")
	.get(function(req, res){
		res.render("frontpage.ejs", { groups: [{name:"세상에 엿을 주자", contents:"히하"}, {name:"그냥 엿", contents:"하.."}]});
	});

app.route(/\/group\/.*/)
	.get(function(req, res){
		// get group info
		res.render(".ejs", { title : "john", groups: [{name:"fuck the world", contents:"haha"}, {name:"just fuck", contents:"ha.."}]});
	})
	.post(function(req, res){
		// create group
	});

app.listen(3000);
console.log("3000번 포트에서 서버 시작".green);
