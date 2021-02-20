const mongoose = require("mongoose");

var taskPlaySchema = mongoose.Schema(
    {
        user: {
            type: Object
        },
        task: {
            type: mongoose.Types.ObjectId,
            ref: "Tasks",
        },
        contestants: [{
            type: mongoose.Types.ObjectId,
            require: true,
        }],
        createdAt: {
            type: Date,
            default: new Date(),
        },
        modifiedAt: {
            type: Date,
        },
        earnPoint: {
            type: Number
        },
        userRanking: {
            type: Number,
        },
        status: {
            type: String,
        }
    }
);

module.exports = taskPlaySchema;