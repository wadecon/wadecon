function searchById(userId, workId, cb){
	Dislike.findOne({
		where: {
			userId: userId,
			workId: workId
		}
	}).then(cb);
}
function toggleTuple( dislike, data, cb ){
	if( dislike != null ){
		Dislike.destroy({
			where: {
				userId: dislike.userId,
				workId: dislike.workId
			}
		}).then(cb);
	}
	else{
		Dislike.create({
			userId: data.userId,
			workId: data.workId
		}).then(cb);
	}
}
function searchUsersDislike( userId, cb ){
	Dislike.findAll({
		where: {
			userId: userId
		} 
	}).then(cb);
}

module.exports = {
	searchById: searchById,
	toggleTuple: toggleTuple,
	searchUsersDislike: searchUsersDislike
}