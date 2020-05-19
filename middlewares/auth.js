const User = require("../models/users");

function isUserLogged(req, res, next) {
	if (req.session && req.session.userId) {
		var userId = req.session.userId;
		User.findById(userId, (err, user) => {
			if (err) return next("Invalid userId in session");
			req.session.loggedUser = user;
			next();
		});
	} else {
		req.session.loggedUser = null;
		next();
	}
}
function restrictUnAuthorised(req, res, next) {
	if (req.session && req.session.userId) {
		next();
	} else {
		res.redirect("/user");
	}
}
module.exports = {
	isUserLogged,
	restrictUnAuthorised,
};
