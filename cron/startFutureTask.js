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

exports.startFutureTask = async function () {

    var eventDB = getModelByShow(config.db, "event", eventModel);
    eventDB.find(function (err, eventInfo) {
        if (err) {
            logger.error("Error while find the task. ");
        } else {
            eventInfo.forEach(element => {
                if (element.status == 'active') {
                    var taskDB = getModelByShow(config.db + '_' + element.databaseId, "task", taskModel);

                    var arr = [{
                        $match: {
                            startAt: { $gt: new Date() }
                        }
                    }];

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
                } else {

                }
            });
        }
    })
}
