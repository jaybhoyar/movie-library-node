var express = require("express");
var router = express.Router();
var Movie = require("../models/movie");
var Comment = require("../models/comments");
var moment = require("moment");
var multer = require("multer");
var path = require("path");
var fs = require("fs");
const auth = require("../middlewares/auth");

// Movie Poster Upload ---
const storage = multer.diskStorage({
	destination: (req, file, callBack) => {
		callBack(null, path.join(__dirname, "../public/images"));
	},
	filename: (req, file, callBack) => {
		callBack(null, `Poster${file.originalname}`);
	},
});
var upload = multer({ storage: storage });

// GET movies listing ---
router.use(auth.restrictUnAuthorised);

router.get("/", (req, res, next) => {
	Movie.find({}, (err, movies) => {
		if (err) next(err);
		res.render("movies.ejs", {
			movies,
			userDetail: req.session.userDetail,
		});
	});
});

router.get("/logout", (req, res, next) => {
	req.session.destroy(function (err) {
		if (err) next(err);
		res.redirect("/user");
	});
});

// Create New Movie ----
router.get("/new", (req, res, next) => {
	console.log("in movie form");
	res.render("movieForm");
});

router.post("/", upload.single("img"), (req, res, next) => {
	console.log("Body", req.body);
	let movieObject = req.body;
	movieObject.img = req.file.filename;
	console.log("file path", req.file);

	movieObject.creator = req.session.userId;
	movieObject.genre = movieObject.genre.split(",");
	movieObject.casts = movieObject.casts.split(",");
	Movie.create(movieObject, (err, createdMovie) => {
		if (err) next(err);
		console.log(createdMovie);
		res.redirect("/movies");
	});
});

// Get Single Movie ----

router.get("/:id", (req, res, next) => {
	var currentUser = req.session.loggedUser;
	let id = req.params.id;
	Movie.findById(id)
		.populate("creator")
		.populate({
			path: "comments",
			populate: {
				path: "author",
				model: "User",
			},
		})
		.exec((err, movie) => {
			if (err) return next(err);
			res.render("detailMovie.ejs", { movie, currentUser, moment });
		});
});

// Update Movie ----
router.get("/editMovie/:id", (req, res, next) => {
	let id = req.params.id;
	console.log("user ID", req.session.userId);
	Movie.findById(id, (err, movie) => {
		if (err) next(err);
		if (req.session.userId == movie.creator._id) {
			res.render("updateMovie.ejs", { movie });
		} else {
			res.redirect("/movies");
		}
	});
});
router.post("/editMovie/:id", upload.single("img"), (req, res, next) => {
	console.log("in Update...");
	let Id = req.params.id;
	let movieObject = req.body;
	movieObject.img = req.file.filename;
	Movie.findByIdAndUpdate(Id, movieObject, (err, movie) => {
		if (err) return next(err);
		console.log(req.body);
		res.redirect(`/movies`);
	});
});

// Delete Movie -----
router.get("/delete/:id", (req, res, next) => {
	let id = req.params.id;
	if (req.session.userId == id) {
		Movie.findByIdAndRemove(id, (err, movie) => {
			if (err) next(err);
			let imagePath = path.join(
				__dirname,
				"../public/uploads/" + movie.img
			);
			fs.unlink(imagePath, (err) => {
				if (err) console.log(err);
			});
			res.redirect("/movies");
		});
	} else {
		res.redirect("/movies");
	}
});

// Handle Comments
router.post("/comments/:id", (req, res, next) => {
	req.body.movieId = req.params.id;
	console.log(req.session.loggedUser.id);
	req.body.author = req.session.loggedUser.id;
	Comment.create(req.body, (err, createdComment) => {
		if (err) next(err);
		console.log(createdComment);
		Movie.findByIdAndUpdate(
			req.params.id,
			{ $push: { comments: createdComment.id } },
			(err, movie) => {
				if (err) next(err);
				console.log(movie);
				res.redirect(`/movies/${req.params.id}`);
			}
		);
	});
});
// Export Routes
module.exports = router;
