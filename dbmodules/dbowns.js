function createOwn( userId, workId, cb ){
	Owns.create({
		userId: userId,
		workId: workId
	}).then(cb);
}
function searchUsersOwn( userId, cb ){
	Owns.findAll({
		where: {
			userId: userId
		} 
	}).then(cb);
}
function searchWorksOwner( workId, cb){
	Owns.findAll({
		where:{
			workId: workId
		}
	}).then(cb);
}

module.exports = {
	createOwn: createOwn,
	searchUsersOwn: searchUsersOwn,
	searchWorksOwner: searchWorksOwner
}