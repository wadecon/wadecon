function searchByNickname(nickname, cb){
	Users.findOne({ // 해당 닉네임 있는지 확인
		where: {
			nickname: nickname
		}
	}).then(cb);
}

module.exports = {
	searchByNickname: searchByNickname
}