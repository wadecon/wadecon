var dbnotices, dbusers, dbdislikes, dbjoins, dbworks, dbowns, dbbadges, dbbadgemaps;
var socket, async;

function setDBs(_dbnotices, _dbusers, _dbdislikes, _dbjoins, _dbworks, _dbowns, _dbbadges, _dbbadgemaps) {
	dbnotices = _dbnotices;
	dbusers = _dbusers;
	dbdislikes = _dbdislikes;
	dbjoins = _dbjoins;
	dbworks = _dbworks;
	dbowns = _dbowns;
	dbbadges = _dbbadges;
	dbbadgemaps = _dbbadgemaps;
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

function updateDislike(data) {
	async.waterfall([
		function(callback) {
			async.parallel([
				function(callback) {
					dbdislikes.searchById(data.userId, data.workId, function(dislikes, err) {
						if(err) console.log(err);
						else{
							callback(null, dislikes);
						}
					});
				},
				function(callback) {
					dbjoins.searchById( data.userId, data.workId, function( result, err ){
						if(err) console.error(err);
						else{
							callback(null, result);
						}
					});
				}
			],
			function(err, result) {
				if(result[1] != null) {
					dbnotices.putNotice(data.userId, "이런반동노무자식!!!");
					dbbadgemaps.
				}
				callback(null, result[0]);
			});
		},
		function(dislikes, callback) {
			dbdislikes.toggleTuple(dislikes, data, function(){
				callback();
			});
		}
	]);

}
function updateJoin(data){
	async.waterfall([
		function(callback) {
			dbjoins.searchById(data.userId, data.workId, function(joins, err){
				if(err) console.log(err);
				else{
					callback(null, joins);
				}
			});
		},
		function(joins, callback) {
			dbjoins.toggleTuple(joins, data, function(){
				callback();
			});
		}
	],
	function(err, result) {
		dbjoins.searchUsersJoin(data.userId, function(result){
			socket.broadcast.emit('serverUpdate',result);
			socket.emit('serverUpdate',result);
		});
	});
}


function getNotice(data){
	// 이거 하자
}

module.exports = {
	setDBs: setDBs,
	setSocketAndAsync: setSocketAndAsync,
	nameCheck: nameCheck,
	titleCheck: titleCheck,
	updateDislike: updateDislike,
	updateJoin: updateJoin
}