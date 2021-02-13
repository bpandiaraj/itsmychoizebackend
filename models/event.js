const mongoose = require("mongoose");

var eventSchema = mongoose.Schema({
    logo: {
        type: String
    },
    banner: {
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
    status: {
        type: String,
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
    },
    translation: {
        type: Object
    },
    startedDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    rules: {
        type: String
    },
    description: {
        type: String
    },
    eventOccurance: {
        type: String
    }
});

module.exports = eventSchema;