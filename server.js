var express = require("express");
var app = express();

app.set("view engine", "ejs");
app.set("views", __dirname+"\\app\\views\\");
app.route("/")
	.get(function(req, res){
		res.render("layout.ejs",{});
	});
	
app.route(/\/group\/.*/)
	.get(function(req, res){
		// get group info
	})
	.post(function(req, res){
		// create group
	})
	.put(function(req, res){
		// edit group
	});
	
app.listen(3000);