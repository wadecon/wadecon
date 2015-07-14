var async = require("async");
function searchById(userId, workId, cb){
	Dislikes.findOne({
		where: {
			userId: userId,
			workId: workId
		}
	}).then(cb);
}

function giveBadge( userId, badgeName ){
	
}

module.exports = {
	searchById: searchById
}