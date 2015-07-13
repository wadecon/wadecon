function putNotice( userId, msg, cb ){
	Notices.create({
		userId: userId,
		msg: msg
	}).then(function(){
		console.log("create notice".cyan);
		if( cb != null ) cb( userId, msg ); // async waterfall 과 쓸때의 범용성을 
	});
}

module.exports = {
	putNotice: putNotice
}