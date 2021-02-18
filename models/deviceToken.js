const mongoose = require("mongoose");

var deviceTokenSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "Users",
            require: true,
        },
        deviceId: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: new Date()
        },
        updatedOn: {
            type: Date,
        }
    }
);

module.exports = deviceTokenSchema;