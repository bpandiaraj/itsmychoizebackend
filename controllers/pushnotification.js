const { sendPushNotification } = require("../shared-function/pushNotification.js");
const deviceModel = require("../models/deviceToken.js");
const logger = require("../config/logger");
const { getModelByShow } = require("../config/db_connection.js");
const notificationModel = require("../models/notification.js");
const { masterDB } = require("../config/config.js");

exports.sendPushNotificationToMobile = function (req, res) {

    sendPushNotification(req.body.messageId,"Notification Test","Checking the notification");

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

exports.getUserNotification = function (req, res) {
    var d = new Date();
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1)
    var diffDate = new Date(d.setDate(diff))
    diffDate.setHours(0)
    diffDate.setMinutes(0)
    diffDate.setSeconds(0)
    console.log("diff", diffDate)
    var arr = [
        {
            $match: {
                user: req.id,
                createdAt: { $gte: new Date(diffDate), $lte: new Date() }
            }
        },
        {
            $sort: {
                createdAt: 1
            },
        }
    ];

    var notificationData = getModelByShow(masterDB, "notification", notificationModel);

    var aggregate = notificationData.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    notificationData.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            console.log(err);
            logger.error(`Error while show notification for user ${req.id}`);
            res.status(400).json({
                apiName: "Notification List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`Show notification for user ${req.id}.`);
            res.json({
                apiName: "Notification List API",
                success: true,
                message: "Successfully view notification list",
                notificationList: listdata,
            });
        }
    });
}