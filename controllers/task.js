const taskModel = require("../models/task.js");
const ObjectId = require("mongodb").ObjectID;
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    masterDB
} = require("../config/config.js");
var logger = require("../config/logger");

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
            var body = JSON.parse(fields.eventInfo);

            if (!body.name || !body.language) {
                logger.error(`Data not found.`);
                return res.status(400).json({
                    apiName: "Task Create API",
                    success: false,
                    message: "Please provide the task information.",
                });
            }

            var taskData = getModelByShow(req.db, "task", taskModel);
            var taskInfo = new taskData({
                name: req.body.name,
                maxContestants: req.body.maxContestants,
                minContestants: req.body.minContestants,
                pointToAdd: req.body.pointToAdd,
                pointToRemove: req.body.pointToRemove,
                totalChangesAccept: req.body.totalChangesAccept,
                rules: req.body.rules,
                status: req.body.status || 'active',
                startAt: req.body.startAt,
                endAt: req.body.endAt,
                createdBy: req.id
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
                    saveImages('create', savedData, files, res, req, eventData);
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
                        logo: newpath1 + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim(),
                        databaseId: data._doc._id
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