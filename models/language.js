const mongoose = require("mongoose");

var languageSchema = mongoose.Schema(
    {
        language: {
            type: String,
        },
        code: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: new Date(),
        }
    }
);

module.exports = languageSchema;