function searchById(userId, workId, cb){
	Dislikes.findOne({
		where: {
			userId: userId,
			workId: workId
		}
	}).then(cb);
}
function toggleTuple( dislikes, data, cb ){
	if( dislikes != null ){
		Dislikes.destroy({
			where: {
				userId: dislikes.userId,
				workId: dislikes.workId
			}
		}).then(cb);
	}
	else{
		Dislikes.create({
			userId: data.userId,
			workId: data.workId
		}).then(cb);
	}
}
function searchUsersDislikes( userId, cb ){
	Dislikes.findAll({
		where: {
			userId: userId
		} 
	}).then(cb);
}
function searchWorksDislikes( workId, cb){
	Dislikes.findAll({
		where:{
			workId: workId
		}
	}).then(cb);
}

module.exports = {
	searchById: searchById,
	toggleTuple: toggleTuple,
	searchUsersDislikes: searchUsersDislikes,
	searchWorksDislikes: searchWorksDislikes
}