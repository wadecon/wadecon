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
								else Users.findOne({
									where: userId
								}).then(function(user, err) {
									if(err) throw err;
									else user.updateAttributes({
										karma: user.karma + badge.karma
									}).then(function(user, err) {
										if(err) throw err;
										else cb(badge, null);
									});
								})
							});
						}
					}
				});
			} else {
				cb(null, null);
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