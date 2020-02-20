var express = require("express");
var router = express.Router();
const User = require("../models/users");
/* GET home page. */
router.get("/", function(req, res, next) {
	res.render("login");
});

router.get("/register", function(req, res, next) {
	res.render("register");
});

router.post("/register", (req, res, next) => {
	User.create(req.body, (err, user) => {
		if (err) next(err);
		console.log(user);
		res.redirect("/user");
	});
});

router.post("/", (req, res, next) => {
	var { email, password } = req.body;
	User.findOne({ email }, (err, user) => {
		if (err) return next(err);
		if (!user) return res.redirect("/user/register");
		if (!user.verifyPassword(password)) return res.send("Wrong Password");
		req.session.userId = user.id;
		req.session.userDetail = user;
		res.redirect("/movies");
	});
});

module.exports = router;
