var async = require("async");

function searchById(userId, workId, cb){
	Dislike.findOne({
		where: {
			userId: userId,
			workId: workId
		}
	}).then(cb);
}
function toggleTuple( dislike, data, cb ){
	if( dislike != null ){
		Dislike.destroy({
			where: {
				userId: dislike.userId,
				workId: dislike.workId
			}
		}).then(cb);
	}
	else{
		Dislike.create({
			userId: data.userId,
			workId: data.workId
		}).then(cb);
	}
}
function searchUsersDislike( userId, cb ){
	Dislike.findAll({
		where: {
			userId: userId
		} 
	}).then(cb);
}
function searchWorksDisklike( workId, cb){
	Dislike.findAll({
		where:{
			workId: workId
		}
	}).then(cb);
}

function getWorksDislikeNum(works, callback){
	var arrWorksDislike = [];
	for( var i = 0; i < works.length; i++){
		(function(i){
			async.waterfall([
				function(cb){
					searchWorksDisklike(works[i].id,function(result){	
						var numDislike = result.length;
						arrWorksDislike[i] = numDislike ;
						cb();
					});
				}
			],
			function(err, result){
				if( i == works.length-1 ){
					callback( arrWorksDislike );
				}
			})
		})(i);
	}
}

function getWorkDislikeNum( workId, cb ){
	searchWorksDisklike( workId, function(result){
		var numDislike = result.length;
		cb(numDislike);
	});
}




module.exports = {
	searchById: searchById,
	toggleTuple: toggleTuple,
	searchUsersDislike: searchUsersDislike,
	searchWorksDisklike: searchWorksDisklike,
	getWorkDislikeNum: getWorkDislikeNum,
	getWorksDislikeNum: getWorksDislikeNum
}