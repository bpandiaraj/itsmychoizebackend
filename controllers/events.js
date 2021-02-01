const eventModel = require("../models/event.js");
const favoriteEventModel = require("../models/favorite_event.js");
const ObjectId = require("mongodb").ObjectID;
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    masterDB
} = require("../config/config.js");
var logger = require("../config/logger");

exports.getEventList = async function (req, res) {
    var eventDB = await getModelByShow(masterDB, "event", eventModel);
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

    // arr.push({
    //     $lookup: {
    //         from: "languages",
    //         localField: "language",
    //         foreignField: "language",
    //         as: "language",
    //     },

    // })

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
                eventList: listdata,
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
                languageList: listdata.length > 0 ? listdata[0].language : [],
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
    eventDB.findOne({
        user: req.id,
        event: req.body.event
    }, function (err, eventInfo) {
        if (err) {
            res.status(400).json({
                apiName: "Event Favorite API",
                success: false,
                message: "Error Occurred",
            });
        } else if (eventInfo) {
            res.json({
                apiName: "Event Favorite API",
                success: true,
                message: "User already saved this event.",
            });
        } else {
            var eventData = new eventDB({
                user: req.id,
                event: req.body.event,
                defaultLanguage: req.body.defaultLanguage || null,
                createdAt: new Date(),
            });

            eventData.save(function (err, savedData) {
                console.log(err)
                if (err) {
                    res.status(400).json({
                        apiName: "Event Favorite API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    console.log("saved", savedData)
                    res.json({
                        apiName: "Event Favorite API",
                        success: true,
                        message: "Event has been favorited",
                    });
                }
            });
        }
    })
}


exports.favoriteEventForUser = function (req, res) {
    var arr = [];
    arr = [{
            $match: {
                user: ObjectId(req.id)
            }
        },
        {
            $lookup: {
                from: "events",
                localField: "event",
                foreignField: "_id",
                as: "event",
            },
        },
        {
            $lookup: {
                from: "languages",
                localField: "defaultLanguage",
                foreignField: "language",
                as: "defaultLanguage",
            },
        },
    ]


    var eventDB = getModelByShow(masterDB, "favoriteEvent", favoriteEventModel);


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
                apiName: "Contestant List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            res.json({
                apiName: "Contestant List API",
                success: true,
                message: "Successfully view Contestant list",
                contestantList: listdata,
                currentPage: req.query.page || 1,
                totalPages: pageCount,
                dataCount: count,
            });
        }
    });
}