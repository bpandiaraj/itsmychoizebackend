// const userModel = require("../models/users.js");
const adminModel = require("../models/admin.js");
const constant = require("../util/constant.json")
const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");

exports.adminLogin = function (req, res) {
    console.log("login", req.body);
    var adminDB = getModelByShow(config.masterDB, "admin", adminModel);
    adminDB.findOne(
        { userName: req.body.userName },
        function (err, loginData) {
            if (err) {
                res.status(401).json({
                    apiName: "User Login API",
                    success: false,
                    message: "Unsuccessful Login"
                });
            } else {
                if (loginData != null) {
                    if (req.body.password == loginData.password) {
                        jwt.sign({
                            loginData,
                        },
                            config.secret,
                            (err, encode) => {
                                res.json({
                                    apiName: "User Login API",
                                    success: true,
                                    message: "User login Successful",
                                    token: encode,
                                    profile: {
                                        _id: loginData._id,
                                        name: loginData.name,
                                        userName: loginData.userName,
                                        profilePicture: loginData.profilePicture,
                                        status: loginData.status
                                    }
                                });
                            }
                        );
                    } else {
                        res.status(401).json({
                            apiName: "User Login API",
                            success: false,
                            message: "User Name or Password incorrect."
                        });
                    }
                } else {
                    res.status(401).json({
                        apiName: "User Login API",
                        success: false,
                        message: "User Not Found"
                    });
                }
            }
        }
    );
};