const mongoose = require("mongoose");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

var adminSchema = mongoose.Schema({
    uid: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    userName: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    profilePicture: {
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
    },
    lastLogin: {
        type: String,
    },
});

// adminSchema.plugin(mongooseAggregatePaginate);

// var admin = mongoose.model("admin", adminSchema);
module.exports = adminSchema;