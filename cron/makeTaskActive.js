const taskModel = require("../models/task.js");
const eventModel = require("../models/event.js");
const taskPlayModel = require("../models/taskPlay.js");
const userModel = require("../models/users.js");
const notificationModel = require("../models/notification.js");
const deviceModel = require("../models/deviceToken.js");
const favoriteEventModel = require("../models/favorite_event.js");

const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");
const cron = require('node-cron');
const { sendPushNotification } = require("../shared-function/pushNotification.js");

exports.makeTaskActiveAndInactive = async function (start, end, taskId, eventId, db) {
    logger.info("User inactive status change event has called");
    var startDate, startDay, startMonth, startHour, startMinute;
    startDate = new Date(start);
    startDay = startDate.getDate();
    startMonth = startDate.getMonth() + 1;
    startHour = startDate.getHours();
    startMinute = startDate.getMinutes();
    console.log("cron", startDay, startMonth, startHour, startMinute);
    var startCron = cron.schedule(`${startMinute} ${startHour} ${startDay} ${startMonth} *`, () => {
        var taskDB = getModelByShow(db, "task", taskModel);
        taskDB.findOne({ _id: taskId }, function (err, taskData) {
            if (err) {
                logger.error("Error while find the task. ");
            } else if (!taskData) {
                logger.info("task not found " + taskId);
            } else {
                taskDB.findByIdAndUpdate(taskId, { "status": "live" }, function (err, taskUpdatedDate) {
                    if (err) {
                        logger.error("Error while update the task. ");
                    } else {
                        logger.info("task has been updated found " + taskId);
                        var eventDB = getModelByShow(config.masterDB, "event", eventModel);
                        eventDB.findById(eventId, function (err, eventData) {
                            if (err) {
                            } else {
                                var favoriteEventData = getModelByShow(config.masterDB, "favoriteEvent", favoriteEventModel);
                                favoriteEventData.find({ event: eventData._id }, function (err, favoriteEventInfo) {
                                    if (err) {
                                        logger.error("Error while update the task. ");
                                    } else {
                                        if (favoriteEventInfo.length > 0) {
                                            favoriteEventInfo.forEach(element => {
                                                var deviceDB = getModelByShow(config.masterDB, "deviceToken", deviceModel);
                                                deviceDB.findOne({ user: element.user }, function (err, useDeviceToken) {
                                                    console.log("useDeviceToken", useDeviceToken)
                                                    if (err) {
                                                        logger.error("Error while update the task. ");
                                                    } else if (!useDeviceToken) {
                                                        logger.error("User token not found ");
                                                    } else {
                                                        var eventMessage = '';
                                                        var eventName = ''
                                                        if (element.defaultLanguage != "en") {
                                                            if (taskData.translation[element.defaultLanguage]) {
                                                                eventMessage = taskData.translation[element.defaultLanguage].startNotification
                                                            } else {
                                                                eventMessage = taskData.startNotification;
                                                            }

                                                            if (eventData.translation.name) {
                                                                eventName = eventData.translation.name
                                                            } else {
                                                                eventName = eventData.name;
                                                            }

                                                        } else {
                                                            eventMessage = taskData.startNotification;
                                                            eventName = eventData.name;
                                                        }

                                                        var notificationData = getModelByShow(config.masterDB, "notification", notificationModel);
                                                        var notificationInfo = new notificationData({
                                                            user: element.user,
                                                            title: eventName,
                                                            message: eventMessage,
                                                            // message: taskData.name + ' will start next few minute dont miss the event.',
                                                            image: '',
                                                            priority: 'high',
                                                            isReaded: false
                                                        })
                                                        notificationInfo.save(function (err, savedNotificationInfo) {
                                                            sendPushNotification([useDeviceToken.deviceId], eventName, eventMessage)
                                                        })
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
        })
    });

    var endDate, endDay, endMonth, endHour, endMinute;
    endDate = new Date(end);
    endDay = endDate.getDate();
    endMonth = endDate.getMonth() + 1;
    endHour = endDate.getHours();
    endMinute = endDate.getMinutes();

    var stopCron = cron.schedule(`${endMinute} ${endHour} ${endDay} ${endMonth} *`, () => {
        var taskDB = getModelByShow(db, "task", taskModel);
        console.log("taskid", taskId)
        taskDB.findOne({ _id: taskId }, function (err, taskData) {
            if (err) {
                logger.error("Error while find the task1. ");
            } else if (!taskData) {
                logger.info("task not found " + taskId);
            } else {
                taskDB.findByIdAndUpdate(taskId, { "status": "inactive" }, function (err, taskUpdatedDate) {
                    if (err) {
                        logger.error("Error while update the task1. ");
                    } else {
                        logger.info("task has been updated found1 " + taskId);
                    }
                })
            }
        })
    });
}