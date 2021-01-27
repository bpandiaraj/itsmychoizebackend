const mongoose = require("mongoose");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

var eventPlaySchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Favorites",
    },
    event: {
        type: mongoose.Types.ObjectId,
        ref: "Events",
    },
    contestants: {
        type: Array,
        require: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    modifiedAt: {
        type: Date,
    },
    userRanking:{
        type: Number,
    }
});

eventPlaySchema.plugin(mongooseAggregatePaginate);

var eventPlay = mongoose.model("eventPlay", eventPlaySchema);
module.exports = eventPlay;