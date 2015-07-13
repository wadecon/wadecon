var async = require("async");
function searchById(userId, workId, cb){
	Dislikes.findOne({
		where: {
			userId: userId,
			workId: workId
		}
	}).then(cb);
}
function toggleTuple( dislikes, data, cb ){
	if( dislikes != null ){
		Dislikes.destroy({
			where: {
				userId: dislikes.userId,
				workId: dislikes.workId
			}
		}).then(cb);
	}
	else{
		Dislikes.create({
			userId: data.userId,
			workId: data.workId
		}).then(cb);
	}
}
function getWorksDislikesNum(works, callback){
	var arrWorksDislikes = [];
	async.forEachOf(works, function(work, key, callback) {
		searchWorksDislikes(work.id,function(result){
			var numDislikes = result.length;
			arrWorksDislikes[key] = numDislikes;
			callback();
		});
	}, function(err) {
		callback(arrWorksDislikes);
	});
}
function getWorkDislikesNum( workId, cb ){
	searchWorksDislikes( workId, function(result){
		var numDislike = result.length;
		cb(numDislike);
	});
}

function searchUsersDislikes( userId, cb ){
	Dislikes.findAll({
		where: {
			userId: userId
		} 
	}).then(cb);
}
function searchWorksDislikes( workId, cb){
	Dislikes.findAll({
		where:{
			workId: workId
		}
	}).then(cb);
}

module.exports = {
	searchById: searchById,
	toggleTuple: toggleTuple,
	searchUsersDislikes: searchUsersDislikes,
	searchWorksDislikes: searchWorksDislikes,
	getWorkDislikesNum: getWorkDislikesNum,
	getWorksDislikesNum: getWorksDislikesNum
}