function searchById(userId, cb){
	BadgeMaps.findAll({
		where: {
			userId: userId
		}
	}).then(cb);
}

function searchBadgeExist( userId, badgeName, cb ){
	BadgeMaps.findOne({
		where:{
			userId: userId,
			badgeName: badgeName
		}
	}).then(cb);
}

function giveBadge( userId, badgeName, cb ){
	Badges.findOne({
		where:{
			name: badgeName
		}
	}).then(function(result, err){
		if(err) console.error(err);
		else{
			if(result == null){
				console.log("fuck it's null!".cyan);
			}
			BadgeMaps.create({
				userId: userId,
				badgeId: result.id,
				badgeName: badgeName
			}).then(cb);	
		}
	})
}


module.exports = {
	searchById: searchById,
	giveBadge: giveBadge,
	searchBadgeExist: searchBadgeExist
}