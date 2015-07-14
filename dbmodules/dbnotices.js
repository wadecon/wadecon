function peekNotice( userId, cb ){
	Notices.findAll({
		where:{
			userId: userId
		}
	}).then(cb);
}

function putNotice( userId, msg, cb ){
	Notices.create({
		userId: userId,
		msg: msg
	}).then(function(){
		console.log("create notice".cyan);
		if(cb != null) cb(userId, msg);	// async waterfall과 사용할때 범용성을 향상시키기 위함
	});
}

module.exports = {
	peekNotice: peekNotice,
	putNotice: putNotice
}