const taskModel = require("../models/task.js");
const eventModel = require("../models/event.js");

const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");
const cron = require('node-cron');

exports.makeTaskActiveAndInactive = async function (start, end, taskId, db) {
    logger.info("User inactive status change event has called");

    var startDate, startDay, startMonth, startHour, startMinute;

    startDate = new Date(start);

    startDay = startDate.getDate();
    startMonth = startDate.getMonth();
    startHour = startDate.getHours();
    startMinute = startDate.getMinutes();

    var startCron = cron.schedule(`${startMinute} ${startHour} ${startDay} ${startMonth} *`, () => {
        var taskDB = getModelByShow(db, "task", taskModel);
        taskDB.findOne({ _id: taskId }, function (err, taskData) {
            if (err) {
                logger.error("Error while find the task. ");
            } else if (taskData) {
                logger.info("task not found " + taskId);
            } else {
                taskData.findByIdAndUpdate(taskId, { "status": "active" }, function (err, taskUpdatedDate) {
                    if (err) {
                        logger.error("Error while update the task. ");
                    } else {
                        logger.info("task has been updated found " + taskId);
                    }
                })
            }
        })
    });
    
    var endDate, endDay, endMonth, endHour, endMinute;

    endDate = new Date(end);

    endDay = startDate.getDate();
    endMonth = startDate.getMonth();
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