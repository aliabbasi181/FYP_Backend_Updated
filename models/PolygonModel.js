var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var PolygonSchema = new Schema({
	name: {type: String, required: true},
	points: {type: Array},
	user: { type: Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});

module.exports = mongoose.model("Polygon", PolygonSchema);