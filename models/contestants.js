const mongoose = require("mongoose");

var contestantSchema = mongoose.Schema({
    name: {
        type: Object,
        require: true,
    },
    images: {
        type: Array,
    },
    biography: {
        type: Object,
        unique: true
    },
    professional: {
        type: Object,
    },
    status: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    modifiedAt: {
        type: Date,
    },
    translations: {
        type: Object
    }
});

module.exports = contestantSchema;