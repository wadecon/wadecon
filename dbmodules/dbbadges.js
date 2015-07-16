var async = require("async");

function createBadge(name, desc, karma, multi, cb) {
	Badges.findOrCreate({
		where:{
			name: name,
			desc: desc,
			karma: karma,
			multi: multi
		}
	}).then(cb);
}

module.exports = {
	createBadge: createBadge
}