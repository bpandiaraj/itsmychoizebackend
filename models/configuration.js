const mongoose = require("mongoose");

var configurationSchema = mongoose.Schema(
    {
        entryPointForUser: {
            type: Number
        },
        pointToMinus: {
            type: Number
        },
        resetDays: {
            type: Number
        },
        maxFavoriteContestant: {
            type: Number
        },
        favoriteContestantChangeDate: {
            type: Number
        }
    }
);

module.exports = configurationSchema;