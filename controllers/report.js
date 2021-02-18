const userModel = require("../models/users.js");
const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");

exports.reportGenerate = (req, res) => {
    var userDB = getModelByShow(config.masterDB, "user", userModel);

    var byCountry = req.query.byCountry
    var byState = req.query.byState
    var byCity = req.query.byCity
    var registerdOn = req.query.registerdOn
    var userStatus = req.query.userStatus
    var userByEvent = req.query.taskPlay

    var query = [];

    if (byCountry) {
        var regionQuery = {
            $match: {
                $or: [{
                    country: {
                        $regex: byCountry,
                        $options: "i"
                    }
                }]
            }
        }

        query.push(regionQuery);
    }
}