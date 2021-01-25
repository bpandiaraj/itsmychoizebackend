var jwt = require('jsonwebtoken');
const userModel = require("../models/users.js");
var express = require("express");
var app = express();
var constant = require("../util/constant.json")
app.set('superSecret', constant.superSecret);
const config = require("../config/config.js");

module.exports = function (req, res, next) {
    var token = req.headers["x-access-token"];
    var app = req.headers['app'];
    if (token) {
        if (app == 'user') {
            admin.firebase_admin
                .auth()
                .verifyIdToken(token)
                .then(function (decodedToken) {
                    userModel.findOne({
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
                                next();
                            }
                        }
                    );
                })
                .catch(function (error) {
                    res.status(403).json({
                        apiName: constant.apiNameToken,
                        success: true,
                        message: constant.apiErrorForbidden
                    });
                });

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