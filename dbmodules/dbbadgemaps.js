var dbusers = require("./dbusers.js");
var async = require('async');

function searchById(userId, cb) {
	BadgeMaps.findAll({
		where: {
			userId: userId
		}
	}).then(cb);
}

function getBadgesOfUser(userId, callback) {
	searchById(userId, function(badgemaps, err) {
		if(err) callback(null, err);
		else {
			var badges = [];
			async.forEachOf(badgemaps, function(bm, key, cb) {
				Badges.findOne({
					where: {
						id: bm.badgeId
					}
				}).then(function (badge, err) {
					if(err) cb(err);
					else {
						badges.push(badge);
						cb(null);
					}
				});
			}, function(err) {
				if(err) callback(null, err);
				else callback(badges);
			});
		}
	});
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
		Badges.findOne({
			where:{
				id: badgeId
			}
		}).then(function(badge, err){
			if(err) throw err;
			else if(badge) {
				searchBadgeExist(userId, badgeId, function(badgemap, err) {
					if(err) throw err;
					else if(badgemap && !badge.multi) cb(null, null); //뱃지가 존재하고 중복으로 수여 불가능
					else {
						badgemap.updateAttributes({
							count: badgemap.count + 1
						}).then(function(bm, err) {
							if(err) throw err;
							else dbusers.addKarma(userId, badge.karma, function() {	// 뱃지를 줬으므로 뱃지의 업보 효과를 유저에게 적용시킨다.
								cb(bm, null);
							});
						});
					}
				});
			} else throw '그런 뱃지 없수다';
		});
	} catch(err) {
		cb(null, err);
	}
}

function removeBadge(userId, badgeId, callback) {
	try {
		searchBadgeExist(userId, badgeId, function(badgemaps, err) {
			if(err) throw err;
			else if(badgemaps) {
				Badges.findOne({
					where: {
						id: badgeId
					}
				}).then(function(badge, err) {
					if(err) throw err;
					else {
						if(badgemap.count > 1) {
							badgemap.updateAttributes({
								count: badgemap.count - 1
							}),then(function(bm, err) {
								if(err) throw err;
								else dbusers.addKarma(userId, -Number(badge.karma), function() {
									callback(null);
								});
							});
						} else {
							BadgeMaps.destroy({
								where: {
									userId: userId,
									badgeId: badgeId
								}
							}).then(function(err) {
								if(err) throw err;
								else dbusers.addKarma(userId, -Number(badge.karma), function() {
									callback(null);
								});
							});
						}
					}
				});
			} else callback(null);
		});
	} catch(err) {
		callback(err);
	}
}


module.exports = {
	searchById: searchById,
	giveBadge: giveBadge,
	searchBadgeExist: searchBadgeExist,
	getBadgesOfUser: getBadgesOfUser,
	removeBadge: removeBadge
}