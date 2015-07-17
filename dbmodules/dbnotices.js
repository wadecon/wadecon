function peekNotice(userId, cb) {
	Notices.findAll({
		where:{
			userId: userId,
			unread: true
		}
	}).then(cb);
}

function readNotice(msgId, callback) {
	Notices.findOne({
		where: {
			id: msgId
		}
	}).then(function(notice, err) {
		if(err) console.error(err);
		else {
			console.log(notice)
			notice.updateAttributes({
				unread: false
			}).then(callback);
		}
	});
}

function putNotice(userId, msg, cb) {
	Notices.create({
		userId: userId,
		msg: msg
	}).then(cb);
}

function removeNotice(msgId, cb) {
	Notices.destroy({
		where:{
			id: msgId
		}
	}).then(cb);
}

module.exports = {
	peekNotice: peekNotice,
	putNotice: putNotice,
	removeNotice: removeNotice,
	readNotice: readNotice
}