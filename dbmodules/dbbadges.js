var async = require("async");

function createBadge( name, desc, karma, cb ){
	Badges.create({
		name: name,
		desc: desc,
		karma: karma
	}).then(cb);
}

module.exports = {
	createBadge: createBadge
}