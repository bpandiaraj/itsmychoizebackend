const taskPlayModel = require("../models/taskPlay.js");
const ObjectId = require("mongodb").ObjectID;
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");
const logger = require("../config/logger");

exports.taskPlayCreate = function (req, res) {

    var taskPlayData = getModelByShow(req.db, "taskPlay", taskPlayModel);

    if (!req.body.task || (Array.isArray(req.body.contestants) && req.body.contestants.length == 0)) {
        return res.status(400).json({
            apiName: "Task Play Create API",
            success: false,
            message: "Please provide the task ID and contestant list to play the task"
        });
    }

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
};