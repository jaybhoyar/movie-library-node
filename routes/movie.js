var express = require("express");
var router = express.Router();
var Movie = require("../models/movie");
var Comment = require("../models/comments");
var multer = require("multer");
var path = require("path");
var fs = require("fs");
const auth = require("../middlewares/auth");

// Movie Poster Upload ---
const storage = multer.diskStorage({
	destination: (req, file, callBack) => {
		callBack(null, path.join(__dirname, "../public/uploads"));
	},
	filename: (req, file, callBack) => {
		callBack(null, `Poster${file.originalname}`);
	}
});
var upload = multer({ storage: storage });

// GET movies listing ---
router.use(auth.restrictUnAuthorised);

router.get("/", (req, res, next) => {
	Movie.find({}, (err, movies) => {
		if (err) next(err);
		res.render("movies.ejs", {
			movies,
			userDetail: req.session.userDetail
		});
	});
});
router.get("/logout", (req, res, next) => {
	req.session.destroy(function(err) {
		if (err) next(err);
		res.redirect("/user");
	});
});

// Create New Movie ----
router.get("/new", (req, res, next) => {
	res.render("movieForm.ejs");
});
router.post("/", upload.single("img"), (req, res, next) => {
	let movieObject = req.body;
	movieObject.img = req.file.filename;
	console.log(movieObject);
	movieObject.genre = movieObject.genre.split(",");
	movieObject.casts = movieObject.casts.split(",");
	Movie.create(movieObject, (err, createdMovie) => {
		if (err) next(err);
		res.redirect("/movies");
	});
});

// Get Single Movie ----

router.get("/:id", (req, res, next) => {
	let id = req.params.id;
	Movie.findById(id)
		.populate("comments")
		.exec((err, movie) => {
			res.render("detailMovie.ejs", { movie });
		});
});

// Update Movie ----
router.get("/editMovie/:id", (req, res, next) => {
	let id = req.params.id;
	Movie.findById(id, (err, movie) => {
		if (err) next(err);
		res.render("updateMovie.ejs", { movie });
	});
});
router.post("/editMovie/:id", (req, res, next) => {
	console.log("in Update...");
	let id = req.params.id;
	Movie.findByIdAndUpdate(id, req.body, (err, movie) => {
		if (err) return next(err);
		res.redirect("/movies");
	});
});

// Delete Movie -----
router.get("/delete/:id", (req, res, next) => {
	let id = req.params.id;
	Movie.findByIdAndRemove(id, (err, movie) => {
		if (err) next(err);
		let imagePath = path.join(__dirname, "../public/uploads/" + movie.img);
		fs.unlink(imagePath, err => {
			if (err) console.log(err);
		});
		res.redirect("/movies");
	});
});
// Handle Comments
router.post("/comments/:id", (req, res, next) => {
	let movieid = req.params.id;
	req.body.movieId = movieid;
	Comment.create(req.body, (err, createdComment) => {
		if (err) next(err);
		Movie.findByIdAndUpdate(
			movieid,
			{ $push: { comments: createdComment.id } },
			(err, movies) => {
				if (err) next(err);
				res.redirect(`/movies/${movieid}`);
			}
		);
	});
});
// Export Routes
module.exports = router;
