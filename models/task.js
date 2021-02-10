const mongoose = require("mongoose");

var taskSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    maxContestants: {
        type: Number
    },
    minContestants: {
        type: Number
    },
    pointToAdd: {
        type: Number
    },
    pointToRemove: {
        type: Number
    },
    totalChangesAccept: {
        type: Number
    },
    images: {
        type: Array
    },
    rules: {
        type: String,
    },
    status: {
        type: String,
    },
    startAt: {
        type: Date
    },
    endAt: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId
    },
    winningContestants: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    createdAt: {
        type: Date,
        default: new Date(),
    },
    modifiedAt: {
        type: Date
    },
    isFeatured:{
        type: Boolean
    },
    translation: {
        type: Object
    }
});

module.exports = taskSchema;