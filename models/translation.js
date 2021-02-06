const mongoose = require("mongoose");

var translationSchema = mongoose.Schema({
    code: {
        type: String,
    },
    translation: {
        type: Object
    }
});

module.exports = translationSchema;