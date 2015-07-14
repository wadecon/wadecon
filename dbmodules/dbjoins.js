var async = require('async');

function searchById(userId, workId, cb) {
	Joins.findOne({
		where: {
			userId: userId,
			workId: workId
		}
	}).then(cb);
}
function toggleTuple(joins, data, cb) {
	if(joins != null) {
		Joins.destroy({
			where: {
				userId: joins.userId,
				workId: joins.workId
			}
		}).then(cb);
	} else {
		Joins.create({
			userId: data.userId,
			workId: data.workId
		}).then(cb);
	}
}
function searchUsersJoin(userId, cb){
	Joins.findAll({
		where: {
			userId: userId
		} 
	}).then(cb);
}
function searchWorksJoin(workId, cb) {
	Joins.findAll({
		where: {
			workId: workId
		}
	}).then(cb);
}
function getUsersBelongToWork(workId, callback) {
	Joins.findAll({
		where: {
			workId: workId
		}
	}).then(function(joins, err) {
		if(err) callback(null, err);
		else {
			var users = [];
			async.forEachOf(joins, function(join, key, cb) {
				Users.findOne({
					id: join.userId
				}).then(function(user, err) {
					if(err) cb(err);
					else {
						users.push(user);
					}
				});
			}, function(err) {
				if(err) callback(null, err);
				else {
					callback(users, null);
				}
			});
		}
	});
}


module.exports = {
	searchById: searchById,
	toggleTuple: toggleTuple,
	searchUsersJoin: searchUsersJoin,
	searchWorksJoin: searchWorksJoin,
	getUsersBelongToWork: getUsersBelongToWork
}