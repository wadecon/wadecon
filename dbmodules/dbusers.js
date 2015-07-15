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
	// var tmp = path.split("/").slice(-1).pop();
	// var directory = tmp.join("/");
	console.log("이건파랑이".cyan+path);
	Users.findOne({
		where: {
			id: userId
		}
	}).then(function(user, err) {
		if(err) console.error(err);
		else {
			user.updateAttributes({
				picture: 'public/images/users/'+userId+'.jpg'
			})
		}
	});
	request
		.get(path)
		.on('response', function(response) {
			console.log(response.statusCode) // 200
			console.log(response.headers['content-type']) // 'image/jpeg'
		})
		.pipe(fs.createWriteStream('public/images/users/'+userId+'.jpg'));
	cb();
}

module.exports = {
	searchByNickname: searchByNickname,
	searchByFbid: searchByFbid,
	searchById: searchById,
	changeNickname: changeNickname,
	editInfoByNickname: editInfoByNickname,
	cacheUserImage: cacheUserImage
};