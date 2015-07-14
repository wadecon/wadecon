function searchByName(name, cb){
	Works.findOne({ // 해당 닉네임 있는지 확인
		where: {
			name: name
		}
	}).then(cb);
}
function createWork(name, desc, cb){
	Works.create({
		name: name,
		desc: desc
	}).then(cb);
}
module.exports = {
	searchByName: searchByName,
	createWork: createWork
}