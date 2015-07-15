var redis = require("redis");
var client = redis.createClient();




client.auth('321654', function(err){
	console.log("Error1 ".red + err);
});

client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": ".red + reply);
    });
    client.quit();
});

module.exports = {
	
}