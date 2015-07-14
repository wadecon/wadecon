var dbnotices, dbusers, dbdislikes, dbjoins, dbworks, dbowns;
var socket, async;

function setDBs(_dbnotices, _dbusers, _dbdislikes, _dbjoins, _dbworks, _dbowns){
	dbnotices = _dbnotices;
	dbusers = _dbusers;
	dbjoins = _dbjoins;
	dbworks = _dbworks;
	dbowns = _dbowns; 
}

function setSocketAndAsync(_socket, _async){
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

function updateDislike(data){
	async.waterfall([
		function(callback){
			async.parralel([
				function(cb){
					dbdislikes.searchById(data.userId, data.workId, function(dislikes, err) {
						if(err) console.log(err);
						else{
							cb(null, dislikes);
						}
					});
				},
				function(cb){
					dbjoins.searchById( function( result, err ){
						if(err) console.error(err);
						else{
							cb(null, result);
						}
					});
				}
			],
			function( err, result ){
				if( result[1] != null ){
					dbnotices.putNotice(data.userId, "이런반동노무자식");
				}
				callback(null, result[0]);
			});
		},
		function( dislikes, callback ){
			dbdislikes.toggleTuple(dislikes, data, function(){
				callback();
			});
		}
		
	]);
	
	// async.waterfall([
	// 	function(cb){
	// 		dbdislikes.searchById(data.userId, data.workId, function(dislikes, err) {
	// 			if(err) console.log(err);
	// 			else{
	// 				cb(null, dislikes);
	// 			}
	// 		});
	// 	},
	// 	function( dislikes, cb ){
	// 		dbdislikes.toggleTuple(dislikes, data, function(){
	// 			cb();
	// 		});
	// 	}
	// ],
	// function(err, result){
	// 	dbdislikes.searchUsersDislikes(data.userId, function(result){
	// 		socket.broadcast.emit('serverUpdate',result);
	// 		socket.emit('serverUpdate',result);
	// 	});
	// });
}
function updateJoin(data){
	async.waterfall([
		function(cb){
			dbjoins.searchById(data.userId, data.workId, function(joins, err){
				if(err) console.log(err);
				else{
					cb(null, joins);
				}
			});
		},
		function(joins, cb){
			dbjoins.toggleTuple(joins, data, function(){
				cb();
			});
		}
	],
	function(err, result){
		dbjoins.searchUsersJoin(data.userId, function(result){
			socket.broadcast.emit('serverUpdate',result);
			socket.emit('serverUpdate',result);
		});
	});
}

function notifyNotice(data){
	
}

module.exports = {
	setDBs: setDBs,
	setSocketAndAsync: setSocketAndAsync,
	nameCheck: nameCheck,
	titleCheck: titleCheck,
	updateDislike: updateDislike,
	updateJoin: updateJoin
}