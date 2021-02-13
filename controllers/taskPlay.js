const taskPlayModel = require("../models/taskPlay.js");
const ObjectId = require("mongodb").ObjectID;
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    masterDB
} = require("../config/config.js");
var logger = require("../config/logger");

exports.taskPlayCreate = function (req, res) {

    var taskPlayData = getModelByShow(req.db, "taskPlay", taskPlayModel);

    var taskPlayInfo = new taskPlayData({
        user: req.id,
        task: req.body.event,
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
            logger.info(`Task play created and image will save.`);
            res.json({
                apiName: "Task Play Create API",
                success: true,
                message: "Task play has been saved successfully."
            });
        }
    });
}