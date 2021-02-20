const taskModel = require("../models/task.js");
const eventModel = require("../models/event.js");
const taskPlayModel = require("../models/taskPlay.js");
const favoriteEventModel = require("../models/favorite_event.js");
const deviceModel = require("../models/deviceToken.js");

const { sendPushNotification } = require("./pushNotification.js");
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");
const logger = require("../config/logger");
const moment = require("moment");

exports.sendNotificationForTaskWinner = async function (taskId, eventId, db) {
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
                                            sendPushNotification([useDeviceToken.deviceId], eventData.name, 'The task ' + taskData.name + ' is ended and winner is announced.')
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