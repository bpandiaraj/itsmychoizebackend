const languageModel = require("../models/language.js");
const config = require("../config/config.js");
const logger = require("../config/logger");
const { getModelByShow } = require("../config/db_connection.js");

exports.getLanguageList = async function (req, res) {
    var languageDB = getModelByShow(config.masterDB, "language", languageModel);
    languageDB.find(function (err, result) {
        if (err) {
            res.status(400).json({
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
};