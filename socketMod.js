var dbnotices, dbusers, dbdislikes, dbjoins, dbworks, dbbadges, dbbadgemaps, dblogs;
var socket, async;

function setDBs(_dbnotices, _dbusers, _dbdislikes, _dbjoins, _dbworks, _dbbadges, _dbbadgemaps, _dblogs) {
	dbnotices = _dbnotices;
	dbusers = _dbusers;
	dbdislikes = _dbdislikes;
	dbjoins = _dbjoins;
	dbworks = _dbworks;
	dbbadges = _dbbadges;
	dbbadgemaps = _dbbadgemaps;
	dblogs = _dblogs
}

function setSocketAndAsync(_socket, _async) {
	socket = _socket;
	async = _async;
}

function nameCheck(data) {
	console.log(data);
	if(data) {
		dbusers.searchByNickname(data, function(user, err) {
			if(err) console.error(err);
			else if(!user) { // 가능한 닉네임
				socket.emit('namechecked', true);
			} else { // 이미 존재하는 닉네임
				socket.emit('namechecked', false);
			}
		});
	} else socket.emit('namechecked', false);
}
function titleCheck(data) {
	console.log(data);
	if(data) {
		dbworks.searchByName(data, function(work, err) {
			if(err) console.error(err);
			else if(!work) { // 가능한 공작이름
				socket.emit('titlechecked', true);
			} else { // 이미 존재하는 공작이름
				socket.emit('titlechecked', false);
			}
		});
	} else socket.emit('titlechecked', false);
}

function getDislikesAtWorkPage(data){
	dbdislikes.getWorkDislikesNum(data.workId, function(numDislikes) {
		console.log("방송을한다!!".cyan);
		socket.emit('serverGetDislikesNum', numDislikes);
		socket.broadcast.emit('serverGetDislikesNum', numDislikes);
	});
}

function updateDislike(data) {
	if(data.userId != null) {
		async.waterfall([
			function(callback) {
				async.parallel([
					function(cb) {
						dbdislikes.searchById(data.userId, data.workId, function(dislikes, err) {
							if(err) console.log(err);
							else{
								cb(null, dislikes);
							}
						});
					},
					function(cb) {
						dbjoins.searchById(data.userId, data.workId, function(result, err) {
							if(err) console.error(err);
							else{
								cb(null, result);
							}
						});
					}
				],
				function(err, result) {
					if(result[0] == null && result[1] != null) {
						dbnotices.putNotice(data.userId, "이런반동놈의자식!!!", function(){
							dbbadgemaps.giveBadge(data.userId, 1, function(something, err) {
								callback(result[0]);
							});
						});
					} else {
						callback(result[0]);
					}
				});
			}
		],
		function(dislikes) {
			dbdislikes.toggleTuple(dislikes, data, function() {
				getDislikesAtWorkPage(data);
			});
		});
	}
}

function updateJoin(data){
	async.waterfall([
		function(callback) {
			dbjoins.searchById(data.userId, data.workId, function(joins, err) {
				if(err) console.log(err);
				else{
					callback(null, joins);
				}
			});
		},
		function(joins, callback) {
			dbjoins.toggleTuple(joins, data, function() {
				callback();
			});
		}
	],
	function(err, result) {
		dbjoins.searchUsersJoin(data.userId, function(result) {
			socket.broadcast.emit('serverUpdate',result);
			socket.emit('serverUpdate',result);
		});
	});
}

function getNotices(data) {
	dbnotices.peekNotice(data.userId, function(result, err) {
		if(err) console.error(err);
		else {
			socket.emit('downNotices', result);
		}
	});
}

function postLog(data) {
	dblogs.createLog(data.userId, data.workName, data.text, dbworks, function(log, err) {
		if(err) console.error(err);
		else{
			console.log("로그가 성공적으로 올라갔습니다.".cyan);
			socket.emit("serverPostLog", {thiss:"sss"})
			getLogs( data );
		}
	});
}

function getLogs(data) {
	dblogs.getWorksAllLog(data.workId, function(result, err) {
		if(err)	console.error(err);
		else{
			console.log("로그를 성공적으로 반환".cyan);
			socket.emit("serverGetLogs", result)
		}
	});
}

function removeNotice(data) {
	dbnotices.removeNotice(data.msgId, function(result, err) {
		console.log("삭제했다!!".cyan);
	});
}

function readNotice(data) {
	dbnotices.readNotice(data.msgId, function(result, err) {
		console.log("읽었다!!".cyan);
	});
}

module.exports = {
	setDBs: setDBs,
	setSocketAndAsync: setSocketAndAsync,
	nameCheck: nameCheck,
	titleCheck: titleCheck,
	updateDislike: updateDislike,
	updateJoin: updateJoin,
	getNotices: getNotices,
	postLog: postLog,
	getLogs: getLogs,
	removeNotice: removeNotice,
	readNotice: readNotice
}