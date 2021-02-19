const favoriteModel = require("../models/favorite.js");
const ObjectId = require("mongodb").ObjectID;
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");
const { allArrayIsEqual } = require("../shared-function/compareArrays.js");
const logger = require("../config/logger");
const userModel = require("../models/users.js");

exports.saveFavoriteContestants = function (req, res) {
    var favoriteDB = getModelByShow(req.db, "favorite", favoriteModel);
    if (!(req.body.contestants instanceof Array)) {
        return res.status(400).json({
            apiName: "Contestant Favorite API",
            success: false,
            message: "Please provide contestant list.",
        });
    }

    if (req.configure.maxFavoriteContestant != req.body.contestants.length) { 
        return res.status(400).json({
            apiName: "Contestant Favorite API",
            success: false,
            message: `Please favorite the ${req.configure.maxFavoriteContestant} contestants.`,
        });
    }

    favoriteDB.findOne(
        { user: req.id, event: req.show },
        function (err, favoriteInfo) {
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
                        userDB.findOne(req.id, function (err, userInfo) {
                            if (err) {
                            } else {
                                var point = userInfo.point - (5 * req.configure.pointToMinus);
                                userDB.findByIdAndUpdate(req.id, { point: point }, function (err, updatedInfo) {
                                    logger.info(`Contestant has been favorited successfully.`);
                                    res.json({
                                        apiName: "Contestant Favorite API",
                                        success: true,
                                        message: "Contestant has been favorited",
                                        point: `${userInfo.point} - (5 * ${req.configure.pointToMinus}) = ${point}`
                                    });
                                })
                            }
                        })

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

                var contestantMatch = allArrayIsEqual(req.body.contestants, favoriteInfo.contestants)
                console.log("array check", contestantMatch);
                console.log("req.configure", req.configure.pointToMinus);
                if (contestantMatch > 0) {
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

                            var userDB = getModelByShow(masterDB, "user", userModel);
                            userDB.findOne(req.id, function (err, userInfo) {
                                if (err) {

                                } else {
                                    var point = userInfo.point - (contestantMatch * req.configure.pointToMinus);
                                    userDB.findByIdAndUpdate(req.id, { point: point }, function (err, updatedInfo) {
                                        logger.info(`Contestant favorite has been updated successfully.`);
                                        res.json({
                                            apiName: "Contestant Favorite API",
                                            success: true,
                                            message: "Contestant favorite has been updated",
                                            point: `${userInfo.point} - (${contestantMatch} * ${req.configure.pointToMinus}) = ${point}`
                                        });
                                    })
                                }
                            })
                        }
                    });
                } else {
                    logger.info(`Contestants are already favorite.`);
                    var userDB = getModelByShow(masterDB, "user", userModel);
                    userDB.findOne(req.id, function (err, userInfo) {
                        if (err) {
                        } else {
                            var point = userInfo.point - (0 * req.configure.pointToMinus);
                            res.json({
                                apiName: "Contestant Favorite API",
                                success: true,
                                message: "Contestants are already favorited",
                                point: `${userInfo.point} - (0 * ${req.configure.pointToMinus}) = ${point}`
                            });
                        }
                    })
                }
            }
        });
};

exports.getMyFavoriteContestants = function (req, res) {

    var language = req.query.language || req.eventLanguage;

    if (language != 'en' && language != 'both' && language != req.nativeLanguage) {
        language = 'en';
    }

    var query = {};
    var rules;
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
            rules = req.eventInformation.translation.rules || '';
        } else {
            query = {
                "translation.en": {
                    "name": "$name",
                    "biography": "$biography",
                    "professional": "$professional"
                },
                "percentage": 20
            }
            rules = req.eventInformation.rules || '';
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
    }

    var arr = [];
    arr = [
        {
            $match: { user: ObjectId(req.id) }
        },
        {
            $lookup: {
                "from": "contestants",
                "let": { "contestants": "$contestants" },
                "pipeline": [
                    {
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
        } else if (Array.isArray(listdata) && listdata.length == 0) {
            logger.info(`My Contestant favorite has been listed successfully.`);
            res.json({
                apiName: "My Favorite Contestants List API",
                success: true,
                message: "Successfully view favorite Contestant list",
                favoriteList: [],
            });
        } else {
            console.log("listed", listdata)
            logger.info(`My Contestant favorite has been listed successfully.`);
            res.json({
                apiName: "My Favorite Contestants List API",
                success: true,
                message: "Successfully view favorite Contestant list",
                favoriteList: listdata[0].contestants || [],
                rules: rules
            });
        }
    });
};