function getWorksAllLog(workId, cb){
	Logs.findAll({
		where:{
			workId: workId
		}
	}).then(cb);
}

function createLog( userId, workName, text, dbworks, cb ){
	dbworks.searchByName( workName, function(work, err ){
		if(err) console.error(err);
		else{
			Logs.create({
				userId: userId,
				workId: work.id,
				text: text
			}).then(cb);
		}
	})
}

module.exports = {
	getWorksAllLog: getWorksAllLog,
	createLog: createLog
}