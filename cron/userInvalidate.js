const userModel = require("../models/users.js");
const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");
const cron = require('node-cron');

exports.makeUserInactive = async function () {
    logger.info("User inactive status change event has called")
    cron.schedule('59 23 * * *', () => {
        logger.info('running a task every day at 23:59 for inactive the user status');
        var userDB = getModelByShow(config.masterDB, "user", userModel);

        var date = new Date();
        var last = new Date(date.getTime() - (15 * 24 * 60 * 60 * 1000));

        console.log("last", last)
        var arr = [{
            $match: {
                lastLogin: { $lte: last }
            }
        }]

        var aggregate = userDB.aggregate(arr);

        var options = {
            page: 1,
            limit: 200,
        };

        userDB.aggregatePaginate(aggregate, options, function (
            err,
            listdata,
            pageCount,
            count
        ) {
            if (err) {
                console.log("er", err)
                logger.error("error while list the user for user inactive")
            } else {
                console.log("listed data", listdata)
                listdata.forEach(element => {
                    userDB.findByIdAndUpdate(element._id, { "status": "offline" }, function (err, updatedData) {
                        if (err) {
                            logger.error("error while update user status as inactive")
                        } else {
                            logger.info("User status has been inactived.")
                        }
                    })
                });
            }
        });
    });
}