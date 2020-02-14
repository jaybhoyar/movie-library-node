var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var commentSchema = new Schema(
	{
		text: {
			type: String,
			required: true
		},
		movieId: {
			type: Schema.Types.ObjectId,
			ref: "Movie",
			required: true
		}
	},
	{ timestamps: true }
);
var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
