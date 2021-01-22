var jwt = require('jsonwebtoken');
// let User = require('../models/users');
var express = require("express");
var app = express();
var constant = require("../util/constant.json")
app.set('superSecret', constant.superSecret);

module.exports = function (req, res, next) {
    var token = req.headers["x-access-token"];
    var app = req.headers['app'];
    if (token) {
        if (app == 'user') {

        } else if (app == 'admin') {
            jwt.verify(token, config.secretKey, function (err, decoded) {
                if (err) {
                    res.status(401).json({
                        apiName: constant.apiNameToken,
                        success: false,
                        message: constant.apiErrorTokenExpired,
                    });
                } else {
                    global.decoded = decoded;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                apiName: constant.apiNameToken,
                success: true,
                message: constant.apiErrorNoAppName
            });
        }
    } else {
        return res.status(403).send({
            apiName: constant.apiNameToken,
            success: true,
            message: constant.apiErrorForbidden
        });
    }
}