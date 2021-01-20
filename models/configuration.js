const mongoose = require("mongoose");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

var configurationSchema = mongoose.Schema({
    entryPointForUser: {
        type: Number
    },
    pointToMinus: {
        type: Number
    },
    resetDays: {
        type: Number
    },
    maxFavoriteContestant: {
        type: Number
    },
    favoriteContestantChangeDate: {
        type: Number
    }
});

configurationSchema.plugin(mongooseAggregatePaginate);

var configuration = mongoose.model("configuration", configurationSchema);
module.exports = configuration;