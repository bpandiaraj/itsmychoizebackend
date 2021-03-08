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

exports.getUserPalyedTask = function (req, res) {
    console.log("user info")
    var arr = [];
    arr = [
        {
            $lookup:{
                from: "tasks",
                localField: "task",
                foreignField: "_id",
                as: "task",
            }
        },
        {
            $project:{
                user:1,
                contestants:1,
                createdAt:1,
                earnPoint:1,
                status:1,
                userRanking:1,
                task: { $arrayElemAt: ["$task", 0] }
            }
        },
        {
            "$group": {
                _id: { user: "$user.userName" },
                user: { "$push": "$user" },
                earnPoint: { $sum: "$earnPoint" },
                tasks: { "$push": "$task" }
            },
        },
        {
            "$project": {
                "user": { $arrayElemAt: ["$user", 0] },
                "_id": 0,
                "earnPoint": 1,
                "tasks": 1
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        { 
            $group: {
                _id: "",
                rankings: {
                    $push: "$$ROOT"
                }
            }
        },
        { 
            $unwind: {
                path: "$rankings",
                includeArrayIndex: "rank"
            }
        },
        {
            "$project": {
                "_id": 0,
                "userId": "$rankings.user._id",
                "tasks": "$rankings.tasks",
                "user": "$rankings.user",
                "earnPoint": "$rankings.earnPoint",
                "rank": 1,
                // "sameRankCount": { $size: "$rankings.participants" }
            }
        },
        {
            $match: { "user._id": ObjectId(req.id)  }
        },
        { 
            $unwind: {
                path: "$tasks",
            }
        },
        {
            $addFields: {
                "week": "$tasks.week",
                "winningContestants": "$tasks.winningContestants"
            } 
        },
        {
            $lookup: {
                from: "contestants",
                localField: "winningContestants",
                foreignField: "_id",
                as: "winningContestants",
            },
        },
        {
            "$sort": {
                "week": 1
            }
        },
        {
            $match : {"tasks.status":"inactive"}
        }
    ]

    var taskPlayDB = getModelByShow(req.db, "taskplay", taskPlayModel);

    var aggregate = taskPlayDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    taskPlayDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            console.log(err)
            logger.error(`Error while list the tasks.`);
            res.status(400).json({
                apiName: "User Played Tasks",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`Ranking has been listed successfully.`);
            res.json({
                apiName: "User Played Tasks",
                success: true,
                message: "Task has been listed successfully",
                taskList: listdata,
            });
        }
    });
}