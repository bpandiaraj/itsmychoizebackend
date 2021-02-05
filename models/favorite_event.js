const mongoose = require("mongoose");

var favoriteEventSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
    },
    event: {
        type: mongoose.Types.ObjectId,
        ref: "Events",
    },
    defaultLanguage: {
        type: String,
    },
    defaulted: {    
        type: Boolean,
    },
    createdAt: {
        type: Date,
    },
    modifiedAt: {
        type: Date,
    }
});

module.exports = favoriteEventSchema;