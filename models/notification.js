const mongoose = require("mongoose");

var notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "Users",
            require: true,
        },
        title: {
            type: String,
        },
        message: {
            type: String,
        },
        image: {
            type: String,
        },
        priority: {
            type: String,
        },
        isReaded: {
            type: Boolean,
        },
        createdAt: {
            type: Date,
            default: new Date()
        },
        updatedAt: {
            type: Date,
        }
    }
);

module.exports = notificationSchema;