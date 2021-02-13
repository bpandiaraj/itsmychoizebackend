const languageModel = require("../models/language.js");
const config = require("../config/config.js");
const {
    getModelByShow
} = require("../config/db_connection.js");
var logger = require("../config/logger");

exports.getLanguageList = async function (req, res) {
    var languageDB = getModelByShow(config.masterDB, "language", languageModel);
    languageDB.find(function (err, result) {
        if (err) {
            res.json({
                apiName: "Language List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            res.json({
                apiName: "Language List API",
                success: true,
                message: "Successfully view language list.",
                languageList: result || []
            });
        }
    });

}