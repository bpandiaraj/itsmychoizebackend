const userModel = require("../models/users.js");
const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");
const moment = require("moment");

exports.reportGenerate = (req, res) => {
    var userDB = getModelByShow(config.masterDB, "user", userModel);

    var byCountry = req.query.byCountry
    var byState = req.query.byState
    var byCity = req.query.byCity
    var registerdOn = req.query.registerdOn
    var userStatus = req.query.userStatus
    var userByEvent = req.query.taskPlay
    var query = [];
    var matchQuery = [];

    if (byCountry) {
        if (byCountry != 'all') {
            var regionQuery = {
                country: {
                    $regex: byCountry,
                    $options: "i"
                }
            }
            matchQuery.push(regionQuery);
        }
    }
    if (byState) {
        if (byState != 'all') {
            var regionQuery = {
                state: {
                    $regex: byState,
                    $options: "i"
                }
            }
            matchQuery.push(regionQuery);
        }
    }
    if (byCity) {
        if (byCity != 'all') {
            var regionQuery = {
                city: {
                    $regex: byCity,
                    $options: "i"
                }
            }
            matchQuery.push(regionQuery);
        }
    }

    if (matchQuery.length > 0) {
        query.push({
            "$match": {
                "$and": matchQuery
            }
        })
    }

    if (registerdOn) {
        if (registerdOn == 'today') {
            query.push({
                $match: {
                    createdAt: { $gte: new Date(), $lt: new Date() }
                }
            })
        } else if (registerdOn == 'week') {
            var d = new Date();
            var day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6 : 1)
            query.push({
                $match: {
                    createdAt: { $gte: new Date(d.setDate(diff)), $lt: new Date() }
                }
            })
        } else if (registerdOn == 'month') {
            var date = new Date()

            query.push({
                $match: {
                    createdAt: { $gte: new Date(date.getFullYear(), date.getMonth(), 1), $lt: new Date() }
                }
            })
        }
    }

    var aggregate = userDB.aggregate(query);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    userDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            res.json({
                apiName: "Users List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            res.json({
                apiName: "Users List API",
                success: true,
                message: "Successfully view users list",
                userList: listdata,
                currentPage: req.query.page,
                totalPages: pageCount,
                dataCount: count,
            });
        }
    });
}