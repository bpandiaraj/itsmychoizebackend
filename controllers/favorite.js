const favoriteModel = require("../models/favorite.js");
const ObjectId = require("mongodb").ObjectID;
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    masterDB
} = require("../config/config.js");
var logger = require("../config/logger");

exports.saveFavoriteContestants = function (req, res) {

    var favoriteDB = getModelByShow(req.db, "favorite", favoriteModel);

    favoriteDB.findOne({
        user: req.id,
        event: req.show
    }, function (err, favoriteInfo) {
        console.log("favoriteInfo", favoriteInfo)
        if (err) {
            logger.error(`Error while contestant favorite.`);
            return res.status(400).json({
                apiName: "Contestant Favorite API",
                success: false,
                message: "Error Occurred",
            });
        } else if (!favoriteInfo) {
            var favoriteData = new favoriteDB({
                user: req.id,
                event: req.show,
                contestants: req.body.contestants,
                createdAt: new Date(),
                modifiedCount: 1
            });

            favoriteData.save(function (err, savedData) {
                if (err) {
                    logger.error(`Error while contestant favorite.`);
                    return res.status(400).json({
                        apiName: "Contestant Favorite API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    logger.info(`Contestant has been favorited successfully.`);
                    res.json({
                        apiName: "Contestant Favorite API",
                        success: true,
                        message: "Contestant has been favorited",
                    });
                }
            });
        } else {
            favoriteDB.findByIdAndUpdate(favoriteInfo._id, {
                contestants: req.body.contestants,
                modifiedCount: favoriteInfo.modifiedCount ? favoriteInfo.modifiedCount + modifiedCount : 1
            }, function (err, doc) {
                if (err) {
                    logger.error(`Error while contestant favorite update.`);
                    return res.status(400).json({
                        apiName: "Contestant Update Favorite API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    logger.info(`Contestant favorite has been updated successfully.`);
                    res.json({
                        apiName: "Contestant Favorite API",
                        success: true,
                        message: "Contestant favorite has been udpated",
                    });
                }
            });
        }
    });
}

exports.getMyFavoriteContestants = function (req, res) {

    var arr = [];
    arr = [{
            $match: {
                user: ObjectId(req.id)
            }
        },
        {
            $lookup: {
                from: "contestants",
                localField: "contestants",
                foreignField: "_id",
                as: "contestants",
            },
        }
    ]

    var favoriteDB = getModelByShow(req.db, "favorite", favoriteModel);
    var aggregate = favoriteDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    favoriteDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            logger.error(`Error while get my favorite contestant.`);
            res.status(400).json({
                apiName: "My Favorite Contestants List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`My Contestant favorite has been listed successfully.`);
            res.json({
                apiName: "My Favorite Contestants List API",
                success: true,
                message: "Successfully view favorite Contestant list",
                favorites: listdata[0].contestants || null,
            });
        }
    });
}