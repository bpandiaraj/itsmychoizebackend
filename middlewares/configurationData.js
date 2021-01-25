'use strict';
const configurationModel = require("../models/configuration.js");

module.exports = function (req, res, next) {
    configurationModel.find(function (err, configureData) {
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