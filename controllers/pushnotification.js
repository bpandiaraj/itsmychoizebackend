const { sendPushNotification } = require("../shared-function/pushNotification.js");
const deviceModel = require("../models/deviceToken.js");
const logger = require("../config/logger");
const { getModelByShow } = require("../config/db_connection.js");


exports.sendPushNotificationToMobile = function (req, res) {

    sendPushNotification(req.body.messageId);

    setTimeout(() => {
        res.json({
            apiName: "Push Notification API",
            success: true,
            message: "Push notification sended",
        })
    }, 500);
}

exports.saveDeviceTokenForUser = function (req, res) {

    if (!req.body.deviceToken) {
        return res.status(400).json({
            apiName: "Push Notification API",
            success: false,
            message: "Please provide the device token.",
        })
    }
    console.log("device token", req.body.deviceToken)

    var deviceDB = getModelByShow(req.db, "deviceToken", deviceModel);

    deviceDB.findOne(
        { user: req.id },
        function (err, deviceInfo) {
            if (err) {
                console.log("err", err)
                logger.error(`Error while find device token 1.`);
                return res.status(400).json({
                    apiName: "Push Notification API",
                    success: false,
                    message: "Error Occurred",
                });
            } else if (!deviceInfo) {

                var deviceData = new deviceDB({
                    user: req.id,
                    deviceId: req.body.deviceToken,
                    createdAt: new Date(),
                });

                deviceData.save(function (err, savedData) {
                    if (err) {
                        console.log("err", err)

                        logger.error(`Error while save device token 2.`);
                        return res.status(400).json({
                            apiName: "Push Notification API",
                            success: false,
                            message: "Error Occurred",
                        });
                    } else {
                        logger.info(`Device token has been successfully.`);
                        res.json({
                            apiName: "Push Notification API",
                            success: true,
                            message: "Device token has been successfully",
                        });
                    }
                });
            } else {
                deviceDB.findByIdAndUpdate(
                    deviceInfo._id,
                    { deviceId: req.body.deviceToken, updatedOn: new Date() },
                    function (err, doc) {
                        if (err) {
                            console.log("err", err);
                            logger.error(`Error while update device token 2`);
                            return res.status(400).json({
                                apiName: "Push Notification API",
                                success: false,
                                message: "Error Occurred",
                            });
                        } else {
                            res.json({
                                apiName: "Push Notification API",
                                success: true,
                                message: "Device token has been updated",
                            });
                        }
                    }
                );
            }
        }
    );
}