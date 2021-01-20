const mongoose = require("mongoose");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

var favoriteSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Favorites",
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
    }
});

favoriteSchema.plugin(mongooseAggregatePaginate);

var favorite = mongoose.model("favorite", favoriteSchema);
module.exports = favorite;