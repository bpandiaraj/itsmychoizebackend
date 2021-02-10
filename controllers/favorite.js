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
    console.log("req.body.contestants", req.body.contestants);
    console.log(req.body.contestants instanceof Array)
    if (!(req.body.contestants instanceof Array)) {
        console.log("is not array")
        return res.status(400).json({
            apiName: "Contestant Favorite API",
            success: false,
            message: "Please provide contestant list.",
        });
    } else {
        console.log("is array");

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

                if (req.body.contestants.length == 0) {
                    return res.status(400).json({
                        apiName: "Contestant Favorite API",
                        success: false,
                        message: "Please provide contestant list.",
                    });
                }

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

                if (req.body.contestants.length == 0) {
                    return res.status(400).json({
                        apiName: "Contestant Favorite API",
                        success: false,
                        message: "Please provide contestant list.",
                    });
                }

                favoriteDB.findByIdAndUpdate(favoriteInfo._id, {
                    contestants: req.body.contestants,
                    modifiedCount: favoriteInfo.modifiedCount ? favoriteInfo.modifiedCount + 1 : 1
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
}

exports.getMyFavoriteContestants = function (req, res) {

    var language = req.query.language || req.eventLanguage;

    if (language != 'en' && language != 'both' && language != req.nativeLanguage) {
        language = 'en';
    }

    var query = {};

    if (language) {
        if (language == 'both') {
            query = {
                "translation.en": {
                    "name": "$name",
                    "biography": "$biography",
                    "professional": "$professional"
                },
                "percentage": 20
            }
        } else if (language != 'en') {
            query = {
                "name": `$translation.${language}.name`,
                "biography": `$translation.${language}.biography`,
                "professional": `$translation.${language}.professional`,
                "percentage": 20
            }
            // arr.push({
            //     $project: {
            //         "translation": 0
            //     },
            // })

        } else {
            query = {
                "translation.en": {
                    "name": "$name",
                    "biography": "$biography",
                    "professional": "$professional"
                },
                "percentage": 20
            }
            // arr.push({
            //     $project: {
            //         "translation": 0
            //     },
            // })
        }
    } else {
        query = {
            "translation.en": {
                "name": "$name",
                "biography": "$biography",
                "professional": "$professional"
            },
            "percentage": 20
        }
        // arr.push({
        //     $project: {
        //         "translation": 0
        //     },
        // })
    }

    var arr = [];
    arr = [{
            $match: {
                user: ObjectId(req.id)
            }
        },
        {
            $lookup: {
                "from": "contestants",
                "let": {
                    "contestants": "$contestants"
                },
                "pipeline": [{
                        "$match": {
                            "$expr": {
                                "$in": ["$_id", "$$contestants"]
                            }
                        },
                    },
                    {
                        "$addFields": query
                    }
                ],
                "as": "contestants"
            }
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
            console.log(err)
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
                favoriteList: listdata[0].contestants || null,
            });
        }
    });
}