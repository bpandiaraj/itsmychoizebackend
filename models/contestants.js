const mongoose = require("mongoose");

var contestantSchema = mongoose.Schema(
    {
        name: {
            type: Object,
            require: true,
        },
        images: {
            type: Array,
        },
        biography: {
            type: Object,
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
        translation: {
            type: Object
        }
    }
);

module.exports = contestantSchema;