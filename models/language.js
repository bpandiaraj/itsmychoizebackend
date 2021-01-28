const mongoose = require("mongoose");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

var languageSchema = mongoose.Schema({
    language: {
        type: String,
    },
    code: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    }
});

languageSchema.plugin(mongooseAggregatePaginate);

var language = mongoose.model("language", languageSchema);
module.exports = language;