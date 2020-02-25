var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var movieSchema = new Schema(
	{
		title: {
			type: String,
			required: true
		},
		synopsis: String,
		releaseDate: {
			type: String
		},
		img: {
			type: String
		},
		rating: {
			type: Number,
			min: 0,
			max: 5
		},
		genre: Array,
		casts: Array,
		creator: {
			type: Schema.Types.ObjectId,
			ref: "User"
		},
		comments: [
			{
				type: Schema.Types.ObjectId,
				ref: "Comment"
			}
		]
	},
	{ timestamps: true }
);
var Movie = mongoose.model("Movie", movieSchema);
module.exports = Movie;
