/// <reference path="typings/node/node.d.ts"/>
var express = require("express");
var app = express();

app.set("view engine", "ejs");
app.set("views", __dirname+"/app/views");
app.use( express.static( __dirname + "/public" ));

app.route("/")
	.get(function(req, res){
		res.render("frontpage", { title : "john" } );
	});

app.route(/\/group\/.*/)
	.get(function(req, res){
		// get group info
	})
	.post(function(req, res){
		// create group
	});

app.listen(3000);
