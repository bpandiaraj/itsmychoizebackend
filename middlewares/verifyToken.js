const jwt = require('jsonwebtoken');
const userModel = require("../models/users.js");
const constant = require("../util/constant.json")
const config = require("../config/config.js");
const { admin } = require("../shared-datas/fire-base.js");
const { getModelByShow } = require("../config/db_connection.js");

module.exports = function (req, res, next) {
    var token = req.headers["x-access-token"];
    var app = req.headers['app'];
    var showDB = req.headers['show'];
    if (token) {
        if (app == 'mobile') {
            console.log("token ", token);
            admin
                .auth()
                .verifyIdToken(token)
                .then(function (decodedToken) {
                    var userDB = getModelByShow(config.masterDB, "user", userModel);
                    userDB.findOne(
                        { uid: decodedToken.uid },
                        function (err, user) {
                            if (!user) {
                                res.status(401).send({
                                    apiName: constant.apiNameToken,
                                    success: false,
                                    message: constant.apiErrorForbidden
                                });
                            } else if (user) {
                                req.id = user._id;
                                req.uid = decodedToken.uid;
                                req.db = showDB ? config.db + "_" + showDB : config.db;
                                req.show = showDB;
                                req.userInfo = {
                                    _id: user._id,
                                    uid: user.uid,
                                    name: user.name,
                                    userName: user.userName,
                                    profilePicture: user.profilePicture
                                };
                                req.user = 'user';
                                next();
                            }
                        }
                    );
                }).catch(function (error) {
                    res.status(403).json({
                        apiName: constant.apiNameToken,
                        success: false,
                        message: error
                    });
                });
        } else if (app == 'admin') {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.status(401).json({
                        apiName: constant.apiNameToken,
                        success: false,
                        message: constant.apiErrorTokenExpired,
                    });
                } else {
                    req.decoded = decoded;
                    req.id = decoded.loginData._id
                    req.db = showDB ? config.db + "_" + showDB : config.db;
                    req.show = showDB;
                    req.user = 'admin';
                    next();
                }
            });
        } else {
            return res.status(400).send({
                apiName: constant.apiNameToken,
                success: false,
                message: constant.apiErrorNoAppName
            });
        }
    } else {
        return res.status(403).send({
            apiName: constant.apiNameToken,
            success: false,
            message: constant.apiErrorForbidden
        });
    }
}