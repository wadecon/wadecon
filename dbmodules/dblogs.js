function getWorksAllLog(workId, cb){
	Logs.findAll({
		where:{
			workId: workId
		}
	}).then(cb);
}

function createLog( userId, workId, text, cb){
	Logs.create({
		userId: userId,
		workId: workId,
		text: text
	}).then(cb);
}

module.exports = {
	getWorksAllLog: getWorksAllLog
}