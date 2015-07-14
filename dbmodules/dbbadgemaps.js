function searchById(userId, cb){
	BadgeMaps.findAll({
		where: {
			userId: userId
		}
	}).then(cb);
}

function searchBadgeExist( userId, badgeName, cb ){
	Badges.findOne({
		where:{
			userId: userId,
			badgeName: badgeName
		}
	}).then(cb);
}

function giveBadge( userId, badgeName, cb ){
	BadgeMaps.create({
		userId: userId,
		badgeName: badgeName
	}).then(cb);
}


module.exports = {
	searchById: searchById,
	giveBadge: giveBadge,
	searchBadgeExist: searchBadgeExist
}