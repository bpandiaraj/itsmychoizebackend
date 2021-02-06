const translationModel = require("../models/translation.js");
const config = require("../config/config.js");
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    admin
} = require("../shared-datas/fire-base.js");
var logger = require("../config/logger");

exports.getTranslation = (req, res) => {
    var translationDB = getModelByShow(config.masterDB, "translation", translationModel);
    var code = req.query.language || "en"
    translationDB.findOne({
        code: code
    }, function (err, translationInfo) {
        console.log("translation",translationInfo)
        var docs = translationInfo._doc;
        if (err) {
            return res.status(400).json({
                apiName: "Get Translation API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            var trans = {
                ...docs,
                ...docs.translation
            }

            delete trans.translation;

            res.json({
                apiName: "Get Translation API",
                success: true,
                message: "Translation found successfully.",
                translation: trans,
            });
        }
    });
};