const configureModel = require("../models/configuration.js");
const config = require("../config/config.js");
const {
    getModelByShow
} = require("../config/db_connection.js");
var logger = require("../config/logger");

exports.getMaxFavoriteContestant = function (req, res) {
    var configureDB = getModelByShow(config.masterDB, "configuration", configureModel);
    configureDB.findOne({}, function (err, result) {
        if (err) {
            res.json({
                apiName: "Max Favorite Contestant API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            res.json({
                apiName: "Max Favorite Contestant API",
                success: true,
                message: "Successfully view max mavorite montestant",
                count: result.maxFavoriteContestant || 5
            });
        }
    });
}