const taskModel = require("../models/task.js");
const eventModel = require("../models/event.js");
const taskPlayModel = require("../models/taskPlay.js");
const favoriteEventModel = require("../models/favorite_event.js");
const deviceModel = require("../models/deviceToken.js");
const notificationModel = require("../models/notification.js");
const translation = require("../util/translation.json")
const { sendPushNotification } = require("./pushNotification.js");
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");
const logger = require("../config/logger");
const moment = require("moment");

exports.sendNotificationForTaskWinner = async function (taskId, eventId, db) {
    console.log("push notification ",taskId, eventId, db)
    var taskDB = getModelByShow(db, "task", taskModel);
    taskDB.findOne({ _id: taskId }, function (err, taskData) {
        if (err) {
            logger.error("Error while find the task. ");
        } else if (!taskData) {
            logger.info("task not found " + taskId);
        } else {
            var eventDB = getModelByShow(masterDB, "event", eventModel);
            eventDB.findById(eventId, function (err, eventData) {
                if (err) {
                } else {
                    var favoriteEventData = getModelByShow(masterDB, "favoriteEvent", favoriteEventModel);
                    favoriteEventData.find({ event: eventData._id }, function (err, favoriteEventInfo) {
                        if (err) {
                            logger.error("Error while update the task. ");
                        } else {
                            if (favoriteEventInfo.length > 0) {
                                favoriteEventInfo.forEach(element => {
                                    var deviceDB = getModelByShow(masterDB, "deviceToken", deviceModel);
                                    deviceDB.findOne({ user: element.user }, function (err, useDeviceToken) {
                                        console.log("useDeviceToken", useDeviceToken)
                                        if (err) {
                                            logger.error("Error while update the task. ");
                                        } else if (!useDeviceToken) {
                                            logger.error("User token not found ");
                                        } else {
                                            var taskPlayData = getModelByShow(db, "taskPlay", taskPlayModel);
                                            taskPlayData.findOne({ task: taskId, "user._id": element.user }, function (err, taskPlayInfo) {
                                                console.log("task ID",taskPlayInfo,taskId,element.user)
                                                if (err) {
                                                    logger.error(`Error while list the task.`);
                                                } else if (!taskPlayInfo) {
                                                    logger.info(`Task play Updated.`);
                                                } else {
                                                    var eventMessage = '';
                                                    var eventName = '';
                                                    var status = "";
                                                    if(taskPlayInfo.earnPoint > 0) {
                                                        status = "taskEndWon"
                                                    } else {
                                                        status = "taskEndLost"
                                                    }
                                                    if (element.defaultLanguage != "en") {
                                                        if (taskData.translation[element.defaultLanguage]) {
                                                            eventMessage = translation[element.defaultLanguage][status]
                                                        } else {
                                                            eventMessage = translation['en'][status]
                                                        }
                                                        if (eventData.translation.name) {
                                                            eventName = eventData.translation.name
                                                        } else {
                                                            eventName = eventData.name;
                                                        }
                                                    } else {
                                                        eventMessage = translation[element.defaultLanguage][status]
                                                        eventName = eventData.name;
                                                    }
                                                    eventMessage = eventMessage.replace('TASKNAME', eventName);
                                                    eventMessage = eventMessage.replace('POINT', taskPlayInfo.earnPoint);

                                                    var notificationData = getModelByShow(masterDB, "notification", notificationModel);
                                                    var notificationInfo = new notificationData({
                                                        user: element.user,
                                                        title: eventName,
                                                        message: eventMessage,
                                                        image: '',
                                                        priority: 'high',
                                                        isReaded: false
                                                    })
                                                    notificationInfo.save(function (err, savedNotificationInfo) {
                                                        sendPushNotification([useDeviceToken.deviceId], eventName, eventMessage)
                                                    })
                                                }
                                            });
                                        }
                                    })
                                });
                            }
                        }
                    })
                }
            });
        }
    })
}