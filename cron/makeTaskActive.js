const taskModel = require("../models/task.js");
const eventModel = require("../models/event.js");
const taskPlayModel = require("../models/taskPlay.js");
const userModel = require("../models/users.js");
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
                                                        sendPushNotification([useDeviceToken.deviceId], eventData.name, taskData.name + ' will start next few minute dont miss the event.')
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
    endDay = startDate.getDate();
    endMonth = startDate.getMonth() + 1;
    endHour = startDate.getHours();
    endMinute = startDate.getMinutes();

    var stopCron = cron.schedule(`${endMinute} ${endHour} ${endDay} ${endMonth} *`, () => {
        var taskDB = getModelByShow(db, "task", taskModel);
        taskDB.findOne({ _id: taskId }, function (err, taskData) {
            if (err) {
                logger.error("Error while find the task. ");
            } else if (taskData) {
                logger.info("task not found " + taskId);
            } else {
                taskData.findByIdAndUpdate(taskId, { "status": "Inactive" }, function (err, taskUpdatedDate) {
                    if (err) {
                        logger.error("Error while update the task. ");
                    } else {
                        logger.info("task has been updated found " + taskId);
                    }
                })
            }
        })
    });
}