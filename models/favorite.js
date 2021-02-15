const mongoose = require("mongoose");

var favoriteSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "Users",
        },
        contestants: [{
            type: mongoose.Types.ObjectId,
            ref: "contestants"
        }],
        event: {
            type: mongoose.Types.ObjectId,
            ref: "Event",
        },
        modifiedCount: {
            type: Number
        },
        createdAt: {
            type: Date,
            default: new Date(),
        },
        modifiedAt: {
            type: Date,
        }
    }
);

module.exports = favoriteSchema;