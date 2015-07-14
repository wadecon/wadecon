var async = require("async");

function searchByName(name, cb){
	Works.findOne({ // 해당 닉네임 있는지 확인
		where: {
			name: name
		}
	}).then(cb);
}
function createWork(name, desc, cb){
	Works.create({
		name: name,
		desc: desc
	}).then(cb);
}
function getDislikeJoinedUserByName(workName, dbjoins, dbdislikes, cb){
	try {
		Works.findOne({
			where: {
				name: workName 
			}
		}).then(function(work, err) {
			if(err) throw err;
			else {
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
			}
		});
	} catch(err) {
		console.error(err);
	}
}

module.exports = {
	searchByName: searchByName,
	createWork: createWork,
	getDislikeJoinedUserByName: getDislikeJoinedUserByName
}