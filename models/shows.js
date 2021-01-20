const mongoose = require("mongoose");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

var showSchema = mongoose.Schema({
    logo: {
        type: String
    },
    name: {
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

showSchema.plugin(mongooseAggregatePaginate);

var show = mongoose.model("show", showSchema);
module.exports = show;