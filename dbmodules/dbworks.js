var async = require("async");

function searchByName(name, cb) {
	Works.findOne({
		where: {
			name: name
		}
	}).then(cb);
}

function searchById(workId, cb) {
	Works.findOne({
		where: {
			id: workId
		}
	}).then(cb);
}

function createWork(name, desc, cb) {
	Works.create({
		name: name,
		desc: desc
	}).then(cb);
}

function editWorkInfo(workId, data, callback) {
	try {
		searchById(workId, function(work, err) {
			if(err) throw err;
			else if(work) {
				work.updateAttributes(data).then(function(work, err) {
					if(err) throw err;
					else callback(work, null);
				});
			} else throw 'No Work';
		});
	} catch(err) {
		console.error(err);
	}
}

function getDislikeJoinedUserByName(workName, dbjoins, dbdislikes, cb){
	try {
		searchByName(workName, function(work, err) {
			if(err) throw err;
			else if(work) {
				async.parallel([
					function(callback) {
						dbjoins.getUsersBelongToWork(work.id, function(users, err) {
							if(err) throw err;
							else callback(null, users);
						});
					},
					function(callback) {
						dbdislikes.searchWorksDislikes(work.id, function(dislikes, err) {
							if(err) throw err;
							else callback(null, dislikes);
						});
					},
					function(callback) {
						callback(null, work);
					}
				],cb);
			} else cb('No work', null);
		});
	} catch(err) {
		console.error(err);
	}
}

module.exports = {
	searchByName: searchByName,
	createWork: createWork,
	getDislikeJoinedUserByName: getDislikeJoinedUserByName,
	editWorkInfo: editWorkInfo
}