function searchByNickname(nickname, cb){
	Users.findOne({ // 해당 닉네임 있는지 확인
		where: {
			nickname: nickname
		}
	}).then(cb);
}

function searchByFbid(fbId, cb){
	Users.findOne({
		where: {
			"fbId": fbId
		}
	}).then(cb);
}

module.exports = {
	searchByNickname: searchByNickname,
	searchByFbid: searchByFbid
}