const mongoose = require("mongoose");
var mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

var userSchema = mongoose.Schema({
    uid: {
        type: String,
        unique: true,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true
    },
    mobile: {
        type: String,
        unique: true
    },
    gender: {
        type: String,
    },
    city: {
        type: String,
    },
    profilePicture: {
        type: String,
    },
    status: {
        type: String,
        require: true,
    },
    isMobileVerified: {
        type: Boolean,
    },
    redeemPoint: {
        type: Number
    },
    point: {
        type: Number
    },
    otp: {
        otp: String,
        time: Date,
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
    favoriteContestant: {
        type: mongoose.Types.ObjectId,
        ref: "Favorites",
    }
});

userSchema.plugin(mongooseAggregatePaginate);

var user = mongoose.model("user", userSchema);
module.exports = user;