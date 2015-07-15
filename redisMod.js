var redis = require("redis");
var client = redis.createClient();

client.auth('321654', function(err){
	console.log("Error(null 이아니면 레디스를 실행시켜라 패스워드는 321654로):  ".red + err);
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
    client.hgetall(userId, function (err, obj) {
        console.dir(obj);
        cb(obj);    // 해시 테이블에 저장되어 있는 오브젝트 반환 (json)
    });
}

function useRedis(req, res, next){
	if( req.user != null ){
		getSession(req.user.id, function(session) {	
			if(session != null) {
				console.log("샷시가 잆다!!! 아들아!!".cyan);
				req.redis = session;	// 세션에 유저가 있을때 세션 정보를 채워줌
				next();
			}else{
				console.log("샷시가 읎다!!! 아들아!!".cyan);
				req.redis = null;	// 세션에 유저가 없으므로 세션을 채워서 보내주지 않음
				next();
			}
		});
	}
	else{
		req.redis = null;	// 로그인 안한 상태이므로 널을 넣어 반환
		next();
	}
}

module.exports = {
	setSession: setSession,
    getSession: getSession,
    useRedis: useRedis
}