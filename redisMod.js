var redis = require("redis");
var client = redis.createClient();

client.auth('321654', function(err){
	console.log("Error1 ".red + err);
});

function vomitErr(err, cb) {
    if(err) cb(err);
}

function setSession(userId, data, cb) {
    client.hset(userId, "nickname", data.nickname, redis.print);
    client.hset(userId, "email", data.email, redis.print);
    client.hset(userId, "name", data.name, redis.print);
    client.hset(userId, "picture", data.picture, redis.print);
    client.hset(userId, "bio", data.bio, redis.print);
    client.hset(userId, "karma", data.karma, redis.print);
    client.hset(userId, "fbId", data.fbId, redis.print);
    client.hset(userId, "fbToken", data.fbToken, redis.print);
    client.hset(userId, "createdAt", data.createAt, redis.print);
    client.hset(userId, "updatedAt", data.updateAt, redis.print);
    cb(null);
}

function getSession(userId, cb) {
    client.hkeys(userId, function (err, replies) {
        console.log(replies.length + " replies:");
        replies.forEach(function (reply, i) {
            console.log("    " + i + ": ".red + reply);
            if(i == replies.length-1) {
                cb(null);
            }
        });
    });
}

module.exports = {
	setSession: setSession,
    getSession: getSession
}