const taskPlayModel = require("../models/taskPlay.js");
const ObjectId = require("mongodb").ObjectID;
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");
const logger = require("../config/logger");
const taskModel = require("../models/task.js");
const moment = require("moment");
const translation = require("../util/translation.json")

exports.taskPlayCreate = function (req, res) {
    var taskPlayData = getModelByShow(req.db, "taskPlay", taskPlayModel);
    eventLanguage = req.eventLanguage || 'en';

    if (!req.body.task || (Array.isArray(req.body.contestants) && req.body.contestants.length == 0)) {
        return res.status(400).json({
            apiName: "Task Play Create API",
            success: false,
            message: translation[eventLanguage].taskIdMissing
        });
    }

    var taskData = getModelByShow(req.db, "task", taskModel);
    taskData.findOne({ "_id": req.body.task }, function (err, taskInfo) {
        if (err) {
            logger.error(`Error while list the task.`);
            res.status(400).json({
                apiName: "Task Play Create API",
                success: false,
                message: translation[eventLanguage].taskPlayError
            });
        } else if (!taskInfo) {
            logger.error(`Task not found`);
            res.status(400).json({
                apiName: "Task Play Create API",
                success: false,
                message: translation[eventLanguage].taskNotFound
            });
        } else {
            if (taskInfo.status == 'live') {
                var today = moment();
                var isBefore = moment(today).isBefore(taskInfo.endAt);
                if (isBefore) {
                    console.log(req.body.contestants)
                    console.log("req.body.contestants.length == taskInfo.maxContestants", req.body.contestants.length, taskInfo.maxContestants)
                    if (req.body.contestants.length == taskInfo.maxContestants) {
                        taskPlayData.findOne({ "user._id": req.id, task: req.body.task }, function (err, taskInformation) {
                            if (err) {
                                logger.error(`Error while list the task.`);
                                res.status(400).json({
                                    apiName: "Task Play Create API",
                                    success: false,
                                    message: translation[eventLanguage].taskPlayError
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
                                            message: translation[eventLanguage].taskPlayError
                                        });
                                    } else {
                                        logger.info(`Task play created.`);
                                        res.json({
                                            apiName: "Task Play Create API",
                                            success: true,
                                            message: translation[eventLanguage].taskPlayError
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
                                            message: translation[eventLanguage].taskPlayError
                                        });
                                    } else {
                                        logger.info(`Task play Updated.`);
                                        res.json({
                                            apiName: "Task Play Updated API",
                                            success: true,
                                            message: translation[eventLanguage].taskPlayError
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        var text = translation[eventLanguage].taskPlayContestantCount.replace("$CONTESTANTCOUNT$", taskInfo.maxContestants)
                        res.status(400).json({
                            apiName: "Task Play Create API",
                            success: false,
                            message: text
                        });
                    }
                } else {
                    res.status(400).json({
                        apiName: "Task Play Create API",
                        success: false,
                        message: translation[eventLanguage].taskPlayTimeout
                    });
                }
            } else {
                res.status(400).json({
                    apiName: "Task Play Create API",
                    success: false,
                    message: translation[eventLanguage].taskInactive
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
            $lookup: {
                from: "tasks",
                localField: "task",
                foreignField: "_id",
                as: "task",
            }
        },
        {
            $project: {
                user: 1,
                contestants: 1,
                createdAt: 1,
                earnPoint: 1,
                status: 1,
                userRanking: 1,
                task: { $arrayElemAt: ["$task", 0] }
            }
        },
        {
            "$group": {
                _id: { user: "$user.userName" },
                user: { "$push": "$user" },
                // taskPlay:{ "$push": {
                //     "earnPoint":"$earnPoint"
                // }},
                tasks: {
                    "$push": {
                        $mergeObjects: ["$task", {
                            wonPoint: { $ifNull: ["$earnPoint", 0] }
                        }]
                    }
                },
                earnPoint: { $sum: "$earnPoint" },
            },
        },
        {
            "$project": {
                "user": { $arrayElemAt: ["$user", 0] },
                "_id": 0,
                "earnPoint": 1,
                "tasks": 1,
                // "taskPlay":1
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
                "taskPlay": "$rankings.taskPlay"
                // "sameRankCount": { $size: "$rankings.participants" }
            }
        },
        {
            $match: { "user._id": ObjectId(req.id) }
        },
        {
            $unwind: {
                path: "$tasks",
            }
        },
        // {
        //     $unwind: {
        //         path: "$taskPlay",
        //     }
        // },
        {
            $addFields: {
                "point": "$tasks.wonPoint",
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
            "$project": {
                "userId": 1,
                "tasks": 1,
                "user": 1,
                "earnPoint": "$point",
                "rank": 1,
                "taskPlay": 1,
                "week": 1,
                "winningContestants": 1
                // "sameRankCount": { $size: "$rankings.participants" }
            }
        },
        {
            "$sort": {
                "week": 1
            }
        },
        {
            $match: { "tasks.status": "inactive" }
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