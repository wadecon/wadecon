var async = require("async");

function createBadge( name, desc, karma, cb ){
	Badges.findOrCreate({
		where:{
			name: name,
			desc: desc,
			karma: karma
		}
	}).then(cb);
}

module.exports = {
	createBadge: createBadge
}