const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
var UserSchema = new Schema(
	{
		name: {
			type: String
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		}
	},
	{ timestamps: true }
);
UserSchema.pre("save", function(next) {
	this.password = bcrypt.hashSync(this.password, 10);
	next();
});
UserSchema.methods.verifyPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

var User = mongoose.model("User", UserSchema);
module.exports = User;
