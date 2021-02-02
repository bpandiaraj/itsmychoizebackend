const mongoose = require("mongoose");

var taskPlaySchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Favorites",
    },
    task: {
        type: mongoose.Types.ObjectId,
        ref: "Tasks",
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

module.exports = taskPlaySchema;