const eventModel = require("../models/event.js");
const favoriteEventModel = require("../models/favorite_event.js");
const ObjectId = require("mongodb").ObjectID;
const {
    getModelByShow
} = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");

exports.getEventList = function (req, res) {
    console.log(req.db)
    var eventDB = getModelByShow(masterDB, "event", eventModel);
    var search = req.body.search;
    var arr = [];
    if (search) {
        arr.push({
            $match: {
                $or: [{
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                }]
            }
        });
    }

    var aggregate = eventDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    eventDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            res.json({
                apiName: "Event List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            res.json({
                apiName: "Event List API",
                success: true,
                message: "Successfully view Event list",
                list: listdata,
                currentPage: req.query.page,
                totalPages: pageCount,
                dataCount: count,
            });
        }
    });
}

exports.getEventLanguage = function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Evetn Language List API",
            success: false,
            message: "Please provide the event ID to get the event language.",
        });
    }

    arr = [{
            $match: {
                _id: ObjectId(req.query.id)
            }
        },
        {
            $lookup: {
                from: "languages",
                localField: "language",
                foreignField: "language",
                as: "language",
            },
        },
    ]

    var eventDB = getModelByShow(masterDB, "event", eventModel);
    var aggregate = eventDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    eventDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            console.log(err)
            res.json({
                apiName: "Event List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            res.json({
                apiName: "Event List API",
                success: true,
                message: "Successfully view Event list",
                list: listdata.length > 0 ? listdata[0].language : [],
                event: {
                    name: listdata[0].name,
                    logo: listdata[0].logo,
                    databaseId: listdata[0].databaseId,
                    _id: listdata[0]._id
                }
            });
        }
    });
}

exports.saveFavoriteEvent = function (req, res) {
    var eventDB = getModelByShow(masterDB, "favoriteEvent", favoriteEventModel);
    
}