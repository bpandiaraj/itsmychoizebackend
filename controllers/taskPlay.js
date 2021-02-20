const taskPlayModel = require("../models/taskPlay.js");
const ObjectId = require("mongodb").ObjectID;
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");
const logger = require("../config/logger");
const taskModel = require("../models/task.js");
const moment = require("moment");

exports.taskPlayCreate = function (req, res) {
    var taskPlayData = getModelByShow(req.db, "taskPlay", taskPlayModel);
    if (!req.body.task || (Array.isArray(req.body.contestants) && req.body.contestants.length == 0)) {
        return res.status(400).json({
            apiName: "Task Play Create API",
            success: false,
            message: "Please provide the task ID and contestant list to play the task"
        });
    }

    var taskData = getModelByShow(req.db, "task", taskModel);
    taskData.findOne({ "_id": req.body.task }, function (err, taskInfo) {
        if (err) {
            logger.error(`Error while list the task.`);
            res.status(400).json({
                apiName: "Task Play Create API",
                success: false,
                message: "Error Occurred"
            });
        } else if (!taskInfo) {
            logger.error(`Task not found`);
            res.status(400).json({
                apiName: "Task Play Create API",
                success: false,
                message: "Task not found"
            });
        } else {
            if (taskInfo.status == 'live') {
                var today = moment();
                var isBefore = moment(today).isBefore(taskInfo.endAt);
                if (isBefore) {
                    if (req.body.contestants.length == taskInfo.maxContestants) {
                        taskPlayData.findOne({ "user._id": req.id, task: req.body.task }, function (err, taskInformation) {
                            if (err) {
                                logger.error(`Error while list the task.`);
                                res.status(400).json({
                                    apiName: "Task Play Create API",
                                    success: false,
                                    message: "Error Occurred"
                                });
                            } else if (!taskInformation) {
                                console.log("taskInformation", taskInformation)
                                var taskPlayInfo = new taskPlayData({
                                    user: req.userInfo,
                                    task: req.body.task,
                                    contestants: req.body.contestants
                                });

                                taskPlayInfo.save(function (err, savedData) {
                                    console.log(err);
                                    if (err) {
                                        logger.error(`Error while list the task.`);
                                        res.status(400).json({
                                            apiName: "Task Play Create API",
                                            success: false,
                                            message: "Error Occurred"
                                        });
                                    } else {
                                        logger.info(`Task play created.`);
                                        res.json({
                                            apiName: "Task Play Create API",
                                            success: true,
                                            message: "Task play has been saved successfully."
                                        });
                                    }
                                });
                            } else {
                                taskPlayData.findByIdAndUpdate(taskInformation._id, {
                                    contestants: req.body.contestants,
                                }, function (err, doc) {
                                    if (err) {
                                        logger.error(`Error while list the task.`);
                                        res.status(400).json({
                                            apiName: "Task Play Updated API",
                                            success: false,
                                            message: "Error Occurred"
                                        });
                                    } else {
                                        logger.info(`Task play Updated.`);
                                        res.json({
                                            apiName: "Task Play Updated API",
                                            success: true,
                                            message: "Task play has been saved successfully."
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.status(400).json({
                            apiName: "Task Play Create API",
                            success: false,
                            message: `Please select the ${taskInfo.maxContestants} contestants.`
                        });
                    }
                }else{
                    res.status(400).json({
                        apiName: "Task Play Create API",
                        success: false,
                        message: "Task play time is ended."
                    });
                }
            } else {
                res.status(400).json({
                    apiName: "Task Play Create API",
                    success: false,
                    message: "You cannot play this task."
                });
            }

        }
    })
};