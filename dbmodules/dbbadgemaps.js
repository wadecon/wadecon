var dbusers = require("./dbusers.js");

function searchById(userId, cb){
	BadgeMaps.findAll({
		where: {
			userId: userId
		}
	}).then(cb);
}

function searchBadgeExist(userId, badgeId, cb) {
	BadgeMaps.findOne({
		where:{
			userId: userId,
			badgeId: badgeId
		}
	}).then(cb);
}

function giveBadge(userId, badgeId, cb) {
	try {
		searchBadgeExist(userId, badgeId, function(exist, err) {
			if(err) throw err;
			if(exist == null) {
				Badges.findOne({
					where:{
						id: badgeId
					}
				}).then(function(badge, err){
					if(err) throw err;
					else {
						if(badge == null) throw 'No Badge';
						else {
							BadgeMaps.create({
								userId: userId,
								badgeId: badge.id
							}).then(function(badgemap, err) {
								if(err) throw err;
								else dbusers.addKarma(userId, 10, function() {	// 뱃지를 줬으므로 뱃지의 업보 효과를 유저에게 적용시킨다.
									cb(null);
								});
							});
						}
					}
				});
			} else {
				cb(null);
			}
		});
	} catch(err) {
		console.error(err);
	}
}


module.exports = {
	searchById: searchById,
	giveBadge: giveBadge,
	searchBadgeExist: searchBadgeExist
}