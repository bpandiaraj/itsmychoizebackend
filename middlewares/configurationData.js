'use strict';
const configurationModel = require("../models/configuration.js");
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");

module.exports = function (req, res, next) {
    var configurationDB = getModelByShow(masterDB, "configuration", configurationModel);
    configurationDB.findOne(function (err, configureData) {
        console.log("configuration", configureData)
        if (err) {
            req.configure = null;
        } else if (!configureData) {
            req.configure = null;
        } else {
            req.configure = configureData;
            next();
        }
    });
}