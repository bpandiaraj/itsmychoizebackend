const eventModel = require("../models/event.js");
const ObjectId = require("mongodb").ObjectID;
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");

module.exports = function (req, res, next) {
    if (!req.show) {
        req.language = [];
        next();
        return
    }

    arr = [
        {
            $match: { _id: ObjectId(req.show) }
        },
        {
            $lookup: {
                from: "languages",
                localField: "language",
                foreignField: "language",
                as: "language",
            },
        }
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
            req.language = [];
            next();
        } else {
            console.log(listdata);
            req.eventInformation = listdata[0];
            req.language = listdata.length > 0 ? listdata[0].language : [];
            req.englishLanguage = listdata[0].language[0].code ? listdata[0].language[0].code : "en"
            req.nativeLanguage = listdata[0].language[1].code ? listdata[0].language[1].code : "en"
            next();
        }
    });
}