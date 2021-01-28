const mongoose = require("mongoose");

var eventSchema = mongoose.Schema({
    logo: {
        type: String
    },
    name: {
        type: String,
        require: true,
    },
    databaseId: {
        type: String,
        require: true,
    },
    language: {
        type: Array,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    modifiedAt: {
        type: Date,
    }
});

module.exports = eventSchema;