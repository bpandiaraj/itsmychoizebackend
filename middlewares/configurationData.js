'use strict';
const configurationModel = require("../models/configuration.js");
const config = require("../config/config.js");

module.exports = function (req, res, next) {
    var configurationDB = getModelByShow(config.masterDB, "configuration", configurationModel);
    configurationDB.find(function (err, configureData) {
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