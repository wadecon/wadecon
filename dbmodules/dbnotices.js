function peekNotice(userId, cb) {
	Notices.findAll({
		where:{
			userId: userId,
			unread: true
		}
	}).then(cb);
}

function readNotice(msgId, callback) {
	Notices.findAll({
		where:{
			msgId; msgId
		}
	}).then(function(noti, err) {
		noti.updateAttibutes({
			unread: false
		}).then(cb);
	});
}

function putNotice(userId, msg, cb) {
	Notices.create({
		userId: userId,
		msg: msg
	}).then(function() {
		console.log("create notice".cyan);
		if(cb != null) cb(userId, msg);	// async waterfall과 사용할때 범용성을 향상시키기 위함
	});
}

function removeNotice(msgId, cb) {
	Notices.destroy({
		where:{
			msgId: msgId
		}
	}).then(cb);
}

module.exports = {
	peekNotice: peekNotice,
	putNotice: putNotice,
	removeNotice: removeNotice,
	readNotice: readNotice
}