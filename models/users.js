const mongoose = require("mongoose");

var userSchema = mongoose.Schema({
    uid: {
        type: String,
        unique: true,
        require: true,
    },
    userName: {
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
        type: String
    },
    gender: {
        type: String
    },
    dob: {
        type: Date
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    city: {
        type: String
    },
    pincode: {
        type: String
    },
    profilePicture: {
        type: String
    },
    status: {
        type: String,
        require: true
    },
    isMobileVerified: {
        type: Boolean
    },
    redeemPoint: {
        type: Number
    },
    point: {
        type: Number
    },
    otp: {
        otp: String,
        time: Date
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    modifiedAt: {
        type: Date
    },
    lastLogin: {
        type: String
    },
    favoriteContestant: {
        type: mongoose.Types.ObjectId,
        ref: "Favorites"
    }
});

module.exports = userSchema;