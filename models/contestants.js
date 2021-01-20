const mongoose = require("mongoose");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

var contestantSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    images: {
        type: Array,
    },
    biography: {
        type: String,
        unique: true
    },
    professional: {
        type: String,
    },
    status: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    modifiedAt: {
        type: Date,
    }
});

contestantSchema.plugin(mongooseAggregatePaginate);

var contestant = mongoose.model("contestant", contestantSchema);
module.exports = contestant;