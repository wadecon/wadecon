/// <reference path="typings/node/node.d.ts"/>
var express = require("express");
var app = express();
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
		var query = connection.query("select * from groups",function(err, rows){
			if (err) {
				console.error(err);
				throw err;
			}
			console.log(query);
			res.render( "frontpage.ejs", {groups: rows} );
		});
	})
	.post(function(req, res){
		var data = {
			group_name : req.body.group_name,
			purpose : req.body.purpose
		};
		var query = connection.query("insert into groups SET ?", data,function(err,result){
	        if (err) {
	            console.error(err);
	            throw err;
	        }
	        console.log(query);
			res.redirect("/");
	    });
	});

app.route(/\/group\/.*/)
	.get(function(req, res){
		// get group info
		console.log("path"+req.path);
		res.render(".ejs", { title : "john", groups: [{name:"fuck the world", contents:"haha"}, {name:"just fuck", contents:"ha.."}]});
	})
	.post(function(req, res){
		// create group
	});

app.listen(3000);
console.log("3000번 포트에서 서버 시작".green);
