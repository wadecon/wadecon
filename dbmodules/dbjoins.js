function searchById(userId, workId, cb){
	Joins.findOne({
		where: {
			userId: userId,
			workId: workId
		}
	}).then(cb);
}
function toggleTuple( joins, data, cb ){
	if( joins != null ){
		Joins.destroy({
			where: {
				userId: joins.userId,
				workId: joins.workId
			}
		}).then(cb);
	}
	else{
		Joins.create({
			userId: data.userId,
			workId: data.workId
		}).then(cb);
	}
}
function searchUsersJoin( userId, cb ){
	Joins.findAll({
		where: {
			userId: userId
		} 
	}).then(cb);
}

module.exports = {
	searchById: searchById,
	toggleTuple: toggleTuple,
	searchUsersJoin: searchUsersJoin
}