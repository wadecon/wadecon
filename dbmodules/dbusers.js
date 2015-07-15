function searchByNickname(nickname, cb) {
	Users.findOne({ // 해당 닉네임 있는지 확인
		where: {
			nickname: nickname
		}
	}).then(cb);
}

function searchById(userId, cb) {
	Users.findOne({
		where: {
			"id": userId
		}
	}).then(cb);
}

function searchByFbid(fbId, cb) {
	Users.findOne({
		where: {
			"fbId": fbId
		}
	}).then(cb);
}

function changeNickname(user, nickname, cb) {
	user.updateAttributes({ // 찾은 유저정보에서 닉네임을 받은 닉네임으로 바꿔준다
		nickname: nickname
	}).then(cb);
}

function editInfoByNickname(nick, data, callback) {
	searchByNickname(nick, function(user, err) {
		if(err) callback(null, err);
		else user.updateAttributes(data).then(callback);
	})
	
}

function cacheUserImage(path, userId, request, fs, cb) {
	console.log("이건파랑이".cyan+path);
	request
		.get( path )
		.on('response', function(response) {
			console.log(response.statusCode) // 200
			console.log(response.headers['content-type']) // 'image/jpeg'
		})
		.pipe(fs.createWriteStream('public/images/users/'+userId+'.jpg'));
	cb();
}

function addToKarma( userId, karma, cb){
	searchById(userId, function(user, err){
		if(err) console.error(err);
		else{
			if( user != null ){
				var addingKarma = Number(user.karma) + Number(karma); // 기존 업보와 인자로 받은 업보를 더함
				console.log(addingKarma+"이거 몇이냐".cyan);
				user.updateAttributes({
					karma: addingKarma
				}).then(cb);
			}
			else{
				cb(null, "없음!"); // 유저가 존재하지 않으므로 없다고 메시지를 보냄
			}
		}
	});
}

module.exports = {
	searchByNickname: searchByNickname,
	searchByFbid: searchByFbid,
	searchById: searchById,
	changeNickname: changeNickname,
	editInfoByNickname: editInfoByNickname,
	cacheUserImage: cacheUserImage,
	addToKarma: addToKarma
};