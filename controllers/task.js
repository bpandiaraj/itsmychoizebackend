const taskModel = require("../models/task.js");
const ObjectId = require("mongodb").ObjectID;
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    masterDB
} = require("../config/config.js");
var logger = require("../config/logger");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const moment = require("moment");

exports.taskCreate = function (req, res) {
    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.maxFileSize = 10 * 1024 * 1024;
    form.keepExtensions = true;
    form.uploadDir = path.join(__dirname, "../images/");
    form.parse(req, async (err, fields, files) => {
        if (err) {
            logger.error(`Error while task creates.`);
            res.status(400).json({
                apiName: "Task Create API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            var body = JSON.parse(fields.taskInfo);

            if (!body.name || !body.maxContestants || !body.pointToAdd || !body.pointToRemove || !body.totalChangesAccept) {
                logger.error(`Data not found.`);
                return res.status(400).json({
                    apiName: "Task Create API",
                    success: false,
                    message: "Please provide the task information.",
                });
            }

            var taskData = getModelByShow(req.db, "task", taskModel);

            var translation = {}
            translation[req.nativeLanguage] = {
                ...body.translation
            };

            var taskInfo = new taskData({
                name: body.name,
                maxContestants: body.maxContestants,
                minContestants: body.minContestants,
                pointToAdd: body.pointToAdd,
                pointToRemove: body.pointToRemove,
                totalChangesAccept: body.totalChangesAccept,
                rules: body.rules,
                status: body.status || 'active',
                startAt: body.startAt,
                endAt: body.endAt,
                isFeatured: body.isFeatured,
                createdBy: req.id,
                translation: translation
            });

            taskInfo.save(function (err, savedData) {
                console.log(err)
                if (err) {
                    logger.error(`Error while list the task.`);
                    res.status(400).json({
                        apiName: "Event Create API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    logger.info(`Task created and image will save.`);
                    saveImages('create', savedData, files, res, req, taskData);
                }
            });
        }
    })
}

function saveImages(t, data, files, res, req, db) {
    if (files.image != undefined) {
        let newpath = `./images/${req.show}/task`;
        let newpath1 = `/${req.show}/task`;
        fs.rename(files.image.path, newpath + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim(), (err) => {
            if (err) {
                logger.error(`Error while save image of task.`);
                console.log("err", err);
            } else {
                db.findByIdAndUpdate(
                    data._doc._id, {
                    images: [newpath1 + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim()]
                },
                    function (err, savedData) {
                        if (err) {
                            logger.error(`Error while update the image url in task collection.`);
                            res.status(400).json({
                                apiName: "Task Create API",
                                success: false,
                                message: "Error Occurred",
                            });
                        } else {
                            logger.info(`Task image url updated successfully.`);
                            res.json({
                                apiName: "Task Create API",
                                success: true,
                                message: "Task has been saved successfully.",
                                id: data._doc._id,
                            });
                        }
                    })
            }
        });
    } else {
        logger.info(`Task detail has been saved and image not uploaded`);
        res.json({
            apiName: "Task Create API",
            success: true,
            message: "Task has been saved successfully.",
            id: data._doc._id,
        });
    }
}

exports.taskImageUpdate = function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Task Create API",
            success: false,
            message: "Please provide the Task ID to update.",
        });
    }

    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.maxFileSize = 10 * 1024 * 1024;
    form.keepExtensions = true;
    form.uploadDir = path.join(__dirname, "../images/");
    form.parse(req, async (err, fields, files) => {
        if (err) {
            logger.error(`Error while task creates.`);
            res.status(400).json({
                apiName: "Task Create API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            var body = JSON.parse(fields.taskInfo);
            console.log("body", body);

            if (!body.name || !body.maxContestants || !body.minContestants || !body.pointToAdd || !body.pointToRemove || !body.totalChangesAccept) {
                logger.error(`Data not found.`);
                return res.status(400).json({
                    apiName: "Task Create API",
                    success: false,
                    message: "Please provide the task information.",
                });
            }

            var translation = {};
            translation[req.nativeLanguage] = {
                ...body.translation
            };
            var tasksData = {
                name: body.name,
                maxContestants: body.maxContestants,
                minContestants: body.minContestants,
                pointToAdd: body.pointToAdd,
                pointToRemove: body.pointToRemove,
                totalChangesAccept: body.totalChangesAccept,
                rules: body.rules,
                status: body.status || 'active',
                startAt: body.startAt,
                endAt: body.endAt,
                isFeatured: body.isFeatured,
                createdBy: req.id,
                translation: translation
            };

            var taskDB = getModelByShow(req.db, "task", taskModel);
            taskDB.findByIdAndUpdate(req.query.id, tasksData, function (err, savedData) {
                if (err) {
                    res.status(400).json({
                        apiName: "Task Update API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else if (!savedData) {
                    res.status(400).json({
                        apiName: "Task Update API",
                        success: false,
                        message: "Task info not found.",
                    });
                } else {
                    console.log("savedData", savedData);
                    if (!body.imageChanged) {
                        updateImages('create', body.imageChanged, files, res, req, taskDB);
                    } else {
                        fs.unlink("./images/" + savedData.images[0], (err) => {
                            if (err) {
                                console.error(err)
                            }
                            updateImages('create', body.imageChanged, files, res, req, taskDB);
                        })
                    }
                }
            });
        }
    })
}

function updateImages(t, data, files, res, req, db) {
    console.log("data.imageChanged", data)
    if (data) {
        console.log("image", files.image)
        if (files.image != undefined) {
            let newpath = `./images/${req.show}/task`;
            let newpath1 = `/${req.show}/task`;
            let savedDate = moment().startOf('day').format("YMMDDHHmmss");
            console.log("savedDate", savedDate)
            fs.rename(files.image.path, newpath + "/" + req.query.id + '_' + savedDate + "." + files.image.path.split(".").pop().trim(), (err) => {
                if (err) {
                    logger.error(`Error while save image of task.`);
                    console.log("err", err);
                } else {
                    db.findByIdAndUpdate(
                        req.query.id, {
                        images: [newpath1 + "/" + req.query.id + '_' + savedDate + "." + files.image.path.split(".").pop().trim()]
                    },
                        function (err, savedData) {
                            if (err) {
                                logger.error(`Error while update the image url in task collection.`);
                                res.status(400).json({
                                    apiName: "Task Create API",
                                    success: false,
                                    message: "Error Occurred"
                                });
                            } else {
                                logger.info(`Task image url updated successfully.`);
                                res.json({
                                    apiName: "Task Create API",
                                    success: true,
                                    message: "Task has been updated successfully."
                                });
                            }
                        })
                }
            });
        } else {
            logger.info(`Task detail has been update and image not updated`);
            res.json({
                apiName: "Task Update API",
                success: true,
                message: "Task has been updated successfully."
            });
        }
    } else {
        logger.info(`Task detail has been update and image not updated`);
        res.json({
            apiName: "Task Update API",
            success: true,
            message: "Task has been updated successfully."
        });
    }
}

exports.tasksList = function (req, res) {
    var search = req.body.search;
    var language = req.query.language || req.eventLanguage;

    if (language != 'en' && language != 'both' && language != req.nativeLanguage) {
        language = 'en';
    }

    var arr = [];

    if (search) {
        arr.push({
            $match: {
                $or: [{
                    name: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    rules: {
                        $regex: search,
                        $options: "i",
                    },
                }
                ],
            },
        });
    }

    if (req.user == 'admin') {
        if (language) {
            if (language == 'both') {
                arr.push({
                    $addFields: {
                        "translation.en": {
                            "name": "$name",
                            "rules": "$rules"
                        },
                        "nativeLanguage": req.nativeLanguage
                    }
                })
            } else if (language != 'en') {
                arr.push({
                    $addFields: {
                        "name": `$translation.${language}.name`,
                        "rules": `$translation.${language}.rules`,
                    }
                })
                arr.push({
                    $project: {
                        "translation": 0
                    },
                })

            } else {
                arr.push({
                    $project: {
                        "translation": 0
                    },
                })
            }
        } else {
            arr.push({
                $project: {
                    "translation": 0
                },
            })
        }
    } else if (req.user == 'user') {
        var transQuery;
        if (language) {
            if (language != 'en') {
                transQuery = {
                    "name": `$translation.${language}.name`,
                    "biography": `$translation.${language}.biography`,
                    "professional": `$translation.${language}.professional`,
                }
                arr.push({
                    $addFields: {
                        "name": `$translation.${language}.name`,
                        "rules": `$translation.${language}.rules`,
                    }
                })
                arr.push({
                    $project: {
                        "translation": 0
                    },
                })
            } else {
                transQuery = {
                    $addFields: {
                        "translation.en": {
                            "name": "$name",
                            "biography": "$biography",
                            "professional": "$professional"
                        },
                    }
                }

                arr.push({
                    $project: {
                        "translation": 0
                    },
                })
            }
        } else {
            transQuery = {
                $addFields: {
                    "translation.en": {
                        "name": "$name",
                        "biography": "$biography",
                        "professional": "$professional"
                    },
                }
            }

            arr.push({
                $project: {
                    "translation": 0
                },
            })
        }

        //Need to add lookup for 
        var secondArr = [{
            $lookup: {
                "from": "taskplays",
                "let": {
                    "id": "$_id",
                    "userId": req.id
                },
                "pipeline": [{
                    "$match": {
                        $and: [
                            {
                                "$expr": {
                                    "$eq": ["$task", "$$id"]
                                }
                            },
                            {
                                "$expr": {
                                    "$eq": ["$user._id", "$$userId"]
                                }
                            }
                        ]
                    },
                }, {
                    "$project": {
                        "_id": 0,
                        "createdAt": 0,
                        "user": 0,
                        "task": 0,
                        "__v": 0
                    }
                }
                ],
                "as": "contestants"
            }
        },
        {
            "$addFields": {
                selectedContestants: {
                    $cond:
                    {
                        if: { $isArray: "$contestants" },
                        then: { $arrayElemAt: ["$contestants", 0] },
                        else: {
                            "contestants": []
                        }
                    }
                }
            },
        },
        {
            "$project": {
                contestants: 0
            }
        },
        {
            "$addFields": {
                contestants: "$selectedContestants.contestants"
            },
        },
        {
            "$project": {
                selectedContestants: 0
            }
        }, {
            $lookup: {
                from: "contestants",
                localField: "contestants",
                foreignField: "_id",
                as: "contestants",
            },
        },
        {
            $sort: {
                isFeatured: -1
            }
        }];

        arr = arr.concat(secondArr);
    }

    if (req.query.status) {
        if (req.query.status != 'all') {
            arr.push({
                $match: {
                    status: req.query.status
                },
            });
        }
    } else {
        arr.push({
            $match: {
                status: 'active'
            },
        });
    }

    arr.push({
        $lookup: {
            from: "contestants",
            localField: "winningContestants",
            foreignField: "_id",
            as: "winningContestants",
        },
    })

    arr.push({
        $sort: {
            status: 1
        },
    });

    var taskDB = getModelByShow(req.db, "task", taskModel)

    var aggregate = taskDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    taskDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            console.log(err);
            logger.error(`Error while list the tasks.`);
            res.status(400).json({
                apiName: "Tasks List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`Tasks has been listed successfully.`);
            res.json({
                apiName: "Tasks List API",
                success: true,
                message: "Successfully view tasks list",
                taskList: listdata,
                currentPage: req.query.page,
                totalPages: pageCount,
                dataCount: count,
            });
        }
    });
};

exports.taskDetails = function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Task Detail API",
            success: false,
            message: "Please provide the task ID to get the task detail.",
        });
    }

    var taskDB = getModelByShow(req.db, "task", taskModel)

    taskDB.findById(req.query.id, function (err, taskInfo) {
        if (err) {
            console.log("err", err);
            res.status(400).json({
                apiName: "Task Detail API",
                success: false,
                message: "Error Occurred",
            });
        } else if (!taskInfo) {
            res.status(400).json({
                apiName: "Task Detail API",
                success: false,
                message: "Task not found.",
            });
        } else {

            var language = req.query.language || req.eventLanguage;

            if (language != 'en' && language != 'both' && language != req.nativeLanguage) {
                language = 'en';
            }
            var translation;
            var task = taskInfo._doc;

            if (language) {
                if (language == 'both') {
                    translation = {
                        ...task.translation,
                        en: {
                            name: task.name,
                            rules: task.rules
                        }
                    }
                    task.translation = translation;
                    task = {
                        ...task,
                        nativeLanguage: req.nativeLanguage
                    }
                } else if (language != 'en') {
                    var trans = task.translation;
                    task = {
                        ...task,
                        nativeLanguage: req.nativeLanguage,
                        name: trans[language].name,
                        rules: trans[language].rules,
                        translation: null
                    }
                    delete task.translation;
                } else {
                    task = task;
                    delete task.translation;
                }
            }

            res.json({
                apiName: "Task Detail API",
                success: true,
                message: "Task has been found.",
                data: task
            });
        }
    });
}

exports.taskWinningContestant = function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Task Winner Contestant Update API",
            success: false,
            message: "Please provide the task ID to update winning contestant.",
        });
    }

    if (!Array.isArray(req.body.winningContestants)) {
        return res.status(400).json({
            apiName: "Task Winner Contestant Update API",
            success: false,
            message: "Please provide the Winning Contestants list.",
        });
    }

    var taskDB = getModelByShow(req.db, "task", taskModel);

    var body = {
        winningContestants: req.body.winningContestants
    }

    taskDB.findByIdAndUpdate(req.query.id, body, function (err, taskInfo) {
        if (err) {
            console.log("err", err);
            res.status(400).json({
                apiName: "Task Winner Contestant Update API",
                success: false,
                message: "Error Occurred",
            });
        } else if (!taskInfo) {
            res.status(400).json({
                apiName: "Task Winner Contestant Update API",
                success: false,
                message: "Task not found.",
            });
        } else {
            res.json({
                apiName: "Task Winner Contestant Update API",
                success: true,
                message: "Task winner contestant has been updated successfully.",
            });
        }
    });
}
