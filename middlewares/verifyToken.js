var jwt = require('jsonwebtoken');
const userModel = require("../models/users.js");
var express = require("express");
var app = express();
var constant = require("../util/constant.json")
app.set('superSecret', constant.superSecret);
const config = require("../config/config.js");
const {
    admin
} = require("../shared-datas/fire-base.js");
const {
    getModelByShow
} = require("../config/db_connection.js");

module.exports = function (req, res, next) {
    var token = req.headers["x-access-token"];
    var app = req.headers['app'];
    var showDB = req.headers['show'];
    if (token) {
        if (app == 'mobile') {
            console.log("token ", token);
            var uid = req.headers['uid'];
            if (uid) {
                admin
                    .auth()
                    .getUser(uid)
                    .then(function (userRecord) {
                        // See the UserRecord reference doc for the contents of userRecord.
                        if (userRecord) {
                            var userDB = getModelByShow(config.masterDB, "user", userModel);
                            userDB.findOne({
                                    uid: uid,
                                },
                                function (err, user) {
                                    if (!user) {
                                        res.status(401).send({
                                            apiName: constant.apiNameToken,
                                            success: true,
                                            message: constant.apiErrorForbidden
                                        });
                                    } else if (user) {
                                        console.log(user)
                                        req.id = user._id;
                                        req.uid = uid;
                                        req.db = showDB ? config.db + "_" + showDB : config.db;
                                        req.show = showDB;
                                        next();
                                    }
                                }
                            );
                        } else {
                            res.status(401).send({
                                apiName: constant.apiNameToken,
                                success: true,
                                message: constant.apiErrorForbidden
                            });
                        }
                    })
                    .catch(function (error) {
                        res.status(403).json({
                            apiName: constant.apiNameToken,
                            success: false,
                            message: error
                        });
                    });
            } else {
                admin
                    .auth()
                    .verifyIdToken(token)
                    .then(function (decodedToken) {
                        console.log("decoded ", decodedToken);
                        var userDB = getModelByShow(config.masterDB, "user", userModel);
                        userDB.findOne({
                                uid: decodedToken.uid,
                            },
                            function (err, user) {
                                if (!user) {
                                    res.status(401).send({
                                        apiName: constant.apiNameToken,
                                        success: true,
                                        message: constant.apiErrorForbidden
                                    });
                                } else if (user) {
                                    req.id = user._id;
                                    req.uid = decodedToken.uid;
                                    req.db = showDB ? config.db + "_" + showDB : config.db;
                                    req.show = showDB;
                                    next();
                                }
                            }
                        );
                    })
                    .catch(function (error) {
                        console.log(error)
                        res.status(403).json({
                            apiName: constant.apiNameToken,
                            success: false,
                            message: error
                        });
                    });
            }
        } else if (app == 'admin') {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    res.status(401).json({
                        apiName: constant.apiNameToken,
                        success: false,
                        message: constant.apiErrorTokenExpired,
                    });
                } else {
                    req.decoded = decoded;
                    req.id = decoded.loginData._id
                    req.db = showDB ? config.db + "_" + showDB : config.db;
                    req.show = showDB;
                    next();
                }
            });
        } else {
            return res.status(403).send({
                apiName: constant.apiNameToken,
                success: false,
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