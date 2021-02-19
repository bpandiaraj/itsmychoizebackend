const taskPlayModel = require("../models/taskPlay.js");
const ObjectId = require("mongodb").ObjectID;
const { getModelByShow } = require("../config/db_connection.js");
const { masterDB } = require("../config/config.js");
const logger = require("../config/logger");

exports.getRankingList = function (req, res) {
    var arr = [];
    arr = [
        {
            "$group": {
                _id: { user: "$user" },
                earnPoint: { $sum: "$earnPoint" },
                tasks: { "$push": "$task" }
            },
        },
        {
            "$project": {
                "user": "$_id.user",
                "_id": 0,
                "earnPoint": 1,
                "tasks": 1
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        { // push all documents, sorted, into an array
            $group: {
                _id: "",
                rankings: {
                    $push: "$$ROOT"
                }
            }
        },
        { // unwind the formed array back into separate documents, but pass the index
            $unwind: {
                path: "$rankings",
                includeArrayIndex: "rank"
            }
        },
        {
            "$project": {
                "_id": 0,
                "tasks": "$rankings.tasks",
                "user": "$rankings.user",
                "earnPoint": "$rankings.earnPoint",
                "rank": 1,
                // "sameRankCount": { $size: "$rankings.participants" }
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        {
            "$group": {
                _id: {
                    earnPoint: "$earnPoint"
                },
                participants: {
                    "$push": "$$ROOT"
                }
            },
        },
        {
            "$project": {
                earnPoint: "$_id.earnPoint",
                _id: 0,
                participants: 1,
                "sameRankCount": { $size: "$participants" },
                rank: { $arrayElemAt: ["$participants", 0] }
            }
        },
        {
            "$project": {
                earnPoint: 1,
                participants: 1,
                sameRankCount: 1,
                profilePicture: "$rank.user.profilePicture",
                rank: "$rank.rank"
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        }
    ]

    var taskPlayDB = getModelByShow(req.db, "taskplay", taskPlayModel);

    var aggregate = taskPlayDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    taskPlayDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            logger.error(`Error while list the tasks.`);
            res.status(400).json({
                apiName: "Ranking List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`Ranking has been listed successfully.`);

            if (listdata.length > 0) {
                if (listdata[0].participants.length >= 3) {
                    listdata.splice(0, 1);
                } else if (listdata[0].participants.length == 2) {
                    listdata.splice(0, 2);
                } else if (listdata[0].participants.length == 1) {
                    listdata.splice(0, 3);
                } else {
                    listdata.splice(0, 3);
                }
            }

            res.json({
                apiName: "Ranking List API",
                success: true,
                message: "Successfully view ranking list",
                rankingList: listdata,
                // bannerRankingList: bannerRankingList,
                currentPage: req.query.page,
                totalPages: pageCount,
                dataCount: count,
            });
        }
    });
};

exports.getRankingBannerList = function (req, res) {
    var arr = [];
    arr = [
        {
            "$group": {
                _id: { user: "$user" },
                earnPoint: { $sum: "$earnPoint" },
                tasks: { "$push": "$task" }
            },
        },
        {
            "$project": {
                "user": "$_id.user",
                "_id": 0,
                "earnPoint": 1,
                "tasks": 1
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        { // push all documents, sorted, into an array
            $group: {
                _id: "",
                rankings: {
                    $push: "$$ROOT"
                }
            }
        },
        { // unwind the formed array back into separate documents, but pass the index
            $unwind: {
                path: "$rankings",
                includeArrayIndex: "rank"
            }
        },
        {
            "$project": {
                "_id": 0,
                "tasks": "$rankings.tasks",
                "user": "$rankings.user",
                "earnPoint": "$rankings.earnPoint",
                "rank": 1,
                "profilePicture": "$rankings.user.profilePicture"
                // "sameRankCount": { $size: "$rankings.participants" }
            }
        },
        {
            $addFields: {
                "sameRankCount": 0
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
    ]

    var taskPlayDB = getModelByShow(req.db, "taskplay", taskPlayModel);

    var aggregate = taskPlayDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 20,
    };

    taskPlayDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            logger.error(`Error while list the tasks.`);
            res.status(400).json({
                apiName: "Ranking Banner List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`Ranking banner has been listed successfully.`);
            var bannerList = listdata;
            var arr1 = [];
            arr1 = [
                {
                    "$group": {
                        _id: { user: "$user" },
                        earnPoint: { $sum: "$earnPoint" },
                        tasks: { "$push": "$task" }
                    },
                },
                {
                    "$project": {
                        "user": "$_id.user",
                        "_id": 0,
                        "earnPoint": 1,
                        "tasks": 1
                    }
                },
                {
                    "$sort": {
                        "earnPoint": -1
                    }
                },
                {
                    $group: {
                        _id: "",
                        rankings: {
                            $push: "$$ROOT"
                        }
                    }
                },
                {
                    $unwind: {
                        path: "$rankings",
                        includeArrayIndex: "rank"
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "tasks": "$rankings.tasks",
                        "user": "$rankings.user",
                        "earnPoint": "$rankings.earnPoint",
                        "rank": 1,
                        "profilePicture": "$rankings.user.profilePicture"
                        // "sameRankCount": { $size: "$rankings.participants" }
                    }
                },
                {
                    $match: {
                        "user._id": req.id
                    }
                }
            ]

            var taskPlayDB1 = getModelByShow(req.db, "taskplay", taskPlayModel);

            var aggregate1 = taskPlayDB1.aggregate(arr1);

            var options1 = {
                page: req.query.page || 1,
                limit: parseInt(req.query.limit) || 20,
            };

            taskPlayDB1.aggregatePaginate(aggregate1, options1, function (
                err,
                listdata,
                pageCount,
                count
            ) {
                if (err) {
                    console.log(err)
                    logger.error(`Error while list the tasks.`);
                    res.status(400).json({
                        apiName: "User Current Ranking List API",
                        success: false,
                        message: "Some Error Occured",
                    });
                } else {
                    console.log("listdata", listdata)
                    var bannerListReorder = [];
                    if (bannerList.length > 0) {
                        bannerListReorder = bannerList.splice(0, 3);
                        console.log("bannerListReorder", bannerListReorder)
                        if (listdata.length > 0) {
                            var alreadyAdded = false;
                            var userIndex;
                            const found = bannerListReorder.some((el, index) => {
                                console.log("el.user._id === req.id", el.user._id, req.id, el.user._id.equals(req.id))
                                if (el.user._id.equals(req.id)) {
                                    userIndex = index
                                    return true;
                                }
                            });
                            if (found) {
                                var alreadyAdded = true;
                                console.log("userIndex", userIndex)
                                bannerListReorder.splice(userIndex, 1);
                                var currentUserRanking = [listdata[0]];
                                bannerListReorder = currentUserRanking.concat(bannerListReorder);
                            } else {
                                bannerListReorder.forEach((element, index) => {
                                    if (!alreadyAdded) {
                                        console.log("element.earnPoint == listdata[0].earnPoint", element.earnPoint, listdata[0].earnPoint)
                                        if (element.earnPoint == listdata[0].earnPoint) {
                                            bannerListReorder[index] = listdata[0];
                                            console.log("bannerList", bannerListReorder)
                                            alreadyAdded = true;
                                        }
                                    }
                                });

                            }
                        }
                    }

                    var previousRanking = 0;
                    var firstRanking = bannerListReorder[0].earnPoint;
                    bannerListReorder.forEach((element, index) => {
                        if (firstRanking == element.earnPoint) {
                            bannerListReorder[index].rank = previousRanking;
                        } else {
                            firstRanking = element.earnPoint;
                            previousRanking = bannerListReorder[index].rank;
                        }
                    });



                    if (listdata.length > 0) {
                        var arr2 = [];
                        arr2 = [
                            {
                                "$group": {
                                    _id: { user: "$user" },
                                    earnPoint: { $sum: "$earnPoint" },
                                    tasks: { "$push": "$task" }
                                },
                            },
                            {
                                "$project": {
                                    "user": "$_id.user",
                                    "_id": 0,
                                    "earnPoint": 1,
                                    "tasks": 1
                                }
                            },
                            {
                                "$sort": {
                                    "earnPoint": -1
                                }
                            },
                            { // push all documents, sorted, into an array
                                $group: {
                                    _id: "",
                                    rankings: {
                                        $push: "$$ROOT"
                                    }
                                }
                            },
                            { // unwind the formed array back into separate documents, but pass the index
                                $unwind: {
                                    path: "$rankings",
                                    includeArrayIndex: "rank"
                                }
                            },
                            {
                                "$project": {
                                    "_id": 0,
                                    "tasks": "$rankings.tasks",
                                    "user": "$rankings.user",
                                    "earnPoint": "$rankings.earnPoint",
                                    "rank": 1,
                                    // "sameRankCount": { $size: "$rankings.participants" }
                                }
                            },
                            {
                                "$sort": {
                                    "earnPoint": -1
                                }
                            },
                            {
                                "$group": {
                                    _id: {
                                        earnPoint: "$earnPoint"
                                    },
                                    participants: {
                                        "$push": "$$ROOT"
                                    }
                                },
                            },
                            {
                                "$project": {
                                    earnPoint: "$_id.earnPoint",
                                    _id: 0,
                                    participants: 1,
                                    "sameRankCount": { $size: "$participants" },
                                    rank: { $arrayElemAt: ["$participants", 0] }
                                }
                            },
                            {
                                "$project": {
                                    earnPoint: 1,
                                    participants: 1,
                                    sameRankCount: 1,
                                    profilePicture: "$rank.user.profilePicture",
                                    rank: "$rank.rank"
                                }
                            },
                            {
                                "$sort": {
                                    "earnPoint": -1
                                }
                            },
                            {
                                $match: {
                                    earnPoint: listdata[0].earnPoint
                                }
                            }

                        ]

                        var taskPlayDB2 = getModelByShow(req.db, "taskplay", taskPlayModel);

                        var aggregate2 = taskPlayDB2.aggregate(arr2);

                        var options2 = {
                            page: req.query.page || 1,
                            limit: parseInt(req.query.limit) || 20,
                        };

                        taskPlayDB1.aggregatePaginate(aggregate2, options2, function (
                            err,
                            listdata2,
                            pageCount,
                            count
                        ) {
                            console.log("listdata2", listdata2)
                            if (err) {

                            } else {
                                if (!alreadyAdded) {
                                    listdata[0].sameRankCount = listdata2[0].participants.length;
                                    var currentUserRanking = [listdata[0]];
                                    bannerListReorder = bannerListReorder.concat(currentUserRanking);
                                }
                                res.json({
                                    apiName: "Ranking Banner List API",
                                    success: true,
                                    message: "Successfully view ranking list",
                                    rankingList: bannerListReorder,
                                });
                            }
                        })
                    } else {
                        res.json({
                            apiName: "Ranking Banner List API",
                            success: true,
                            message: "Successfully view ranking list",
                            rankingList: bannerListReorder,
                        });
                    }

                }
            });
        }
    });
};

exports.getUserCurrentRanking = function (req, res) {
    var arr = [];
    arr = [
        {
            "$group": {
                _id: { user: "$user" },
                earnPoint: { $sum: "$earnPoint" },
                tasks: { "$push": "$task" }
            },
        },
        {
            "$project": {
                "user": "$_id.user",
                "_id": 0,
                "earnPoint": 1,
                "tasks": 1
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        { // push all documents, sorted, into an array
            $group: {
                _id: "",
                rankings: {
                    $push: "$$ROOT"
                }
            }
        },
        { // unwind the formed array back into separate documents, but pass the index
            $unwind: {
                path: "$rankings",
                includeArrayIndex: "rank"
            }
        },
        {
            "$project": {
                "_id": 0,
                "userId": "$rankings.user._id",
                "tasks": "$rankings.tasks",
                "user": "$rankings.user",
                "earnPoint": "$rankings.earnPoint",
                "rank": 1,
                // "sameRankCount": { $size: "$rankings.participants" }
            }
        },
        // {
        //     $match: { "userId": req.id  }
        // }
    ]

    var taskPlayDB = getModelByShow(req.db, "taskplay", taskPlayModel);

    var aggregate = taskPlayDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    taskPlayDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            console.log(err)
            logger.error(`Error while list the tasks.`);
            res.status(400).json({
                apiName: "User Current Ranking List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`Ranking has been listed successfully.`);
            res.json({
                apiName: "User Current Ranking List API",
                success: true,
                message: "Successfully view ranking list",
                userId: req.id,
                ranking: listdata,
            });
        }
    });
};

exports.getTop3RankingList = function (req, res) {
    var arr = [];
    arr = [
        {
            "$group": {
                _id: { user: "$user" },
                earnPoint: { $sum: "$earnPoint" },
                tasks: { "$push": "$task" }
            },
        },
        {
            "$project": {
                "user": "$_id.user",
                "_id": 0,
                "earnPoint": 1,
                "tasks": 1
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        { // push all documents, sorted, into an array
            $group: {
                _id: "",
                rankings: {
                    $push: "$$ROOT"
                }
            }
        },
        { // unwind the formed array back into separate documents, but pass the index
            $unwind: {
                path: "$rankings",
                includeArrayIndex: "rank"
            }
        },
        {
            "$project": {
                "_id": 0,
                "tasks": "$rankings.tasks",
                "user": "$rankings.user",
                "earnPoint": "$rankings.earnPoint",
                "rank": 1,
                "profilePicture": "$rankings.user.profilePicture"
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
    ]

    var taskPlayDB = getModelByShow(req.db, "taskplay", taskPlayModel);

    var aggregate = taskPlayDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 3,
    };

    taskPlayDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            logger.error(`Error while list the tasks.`);
            res.status(400).json({
                apiName: "Top 3 Ranking List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            var previousRanking = 0;
            var firstRanking = listdata[0].earnPoint;
            listdata.forEach((element, index) => {
                if (firstRanking == element.earnPoint) {
                    listdata[index].rank = previousRanking;
                } else {
                    firstRanking = element.earnPoint;
                    previousRanking = listdata[index].rank;
                }
            });
            console.log("listData", listdata);
            res.json({
                apiName: "Top 3 Ranking List API",
                success: true,
                message: "Successfully view ranking list",
                rankingList: listdata,
            });
        }
    });
};

exports.getTop10RankingList = function (req, res) {
    var arr = [];
    arr = [
        {
            "$group": {
                _id: { user: "$user" },
                earnPoint: { $sum: "$earnPoint" },
                tasks: { "$push": "$task" }
            },
        },
        {
            "$project": {
                "user": "$_id.user",
                "_id": 0,
                "earnPoint": 1,
                "tasks": 1
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        { // push all documents, sorted, into an array
            $group: {
                _id: "",
                rankings: {
                    $push: "$$ROOT"
                }
            }
        },
        { // unwind the formed array back into separate documents, but pass the index
            $unwind: {
                path: "$rankings",
                includeArrayIndex: "rank"
            }
        },
        {
            "$project": {
                "_id": 0,
                "tasks": "$rankings.tasks",
                "user": "$rankings.user",
                "earnPoint": "$rankings.earnPoint",
                "rank": 1,
                // "sameRankCount": { $size: "$rankings.participants" }
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        {
            "$group": {
                _id: {
                    earnPoint: "$earnPoint"
                },
                participants: {
                    "$push": "$$ROOT"
                }
            },
        },
        {
            "$project": {
                earnPoint: "$_id.earnPoint",
                _id: 0,
                participants: 1,
                "sameRankCount": { $size: "$participants" },
                rank: { $arrayElemAt: ["$participants", 0] }
            }
        },
        {
            "$project": {
                earnPoint: 1,
                participants: 1,
                sameRankCount: 1,
                profilePicture: "$rank.user.profilePicture",
                rank: "$rank.rank"
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        }
    ]

    var taskPlayDB = getModelByShow(req.db, "taskplay", taskPlayModel);

    var aggregate = taskPlayDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 10,
    };

    taskPlayDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            logger.error(`Error while list the tasks.`);
            res.status(400).json({
                apiName: "Top 10 Ranking List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            var previousRanking = 0;
            var firstRanking = listdata[0].earnPoint;
            listdata.forEach((element, index) => {
                if (firstRanking == element.earnPoint) {
                    listdata[index].rank = previousRanking;
                } else {
                    firstRanking = element.earnPoint;
                    previousRanking = listdata[index].rank;
                }
            });
            console.log("listData", listdata);
            res.json({
                apiName: "Top 10 Ranking List API",
                success: true,
                message: "Successfully view ranking list",
                rankingList: listdata,
            });
        }
    });
};

exports.getOverAllRankingList = function (req, res) {
    var arr = [];
    arr = [
        {
            "$group": {
                _id: { user: "$user" },
                earnPoint: { $sum: "$earnPoint" },
                tasks: { "$push": "$task" }
            },
        },
        {
            "$project": {
                "user": "$_id.user",
                "_id": 0,
                "earnPoint": 1,
                "tasks": 1
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        { // push all documents, sorted, into an array
            $group: {
                _id: "",
                rankings: {
                    $push: "$$ROOT"
                }
            }
        },
        { // unwind the formed array back into separate documents, but pass the index
            $unwind: {
                path: "$rankings",
                includeArrayIndex: "rank"
            }
        },
        {
            "$project": {
                "_id": 0,
                "tasks": "$rankings.tasks",
                "user": "$rankings.user",
                "earnPoint": "$rankings.earnPoint",
                "rank": 1,
                // "sameRankCount": { $size: "$rankings.participants" }
            }
        },
        {
            "$sort": {
                "earnPoint": -1
            }
        },
        // {
        //     "$group": {
        //         _id: {
        //             earnPoint: "$earnPoint"
        //         },
        //         participants: {
        //             "$push": "$$ROOT"
        //         }
        //     },
        // },
        // {
        //     "$project": {
        //         earnPoint: "$_id.earnPoint",
        //         _id: 0,
        //         participants: 1,
        //         "sameRankCount": { $size: "$participants" },
        //         rank: { $arrayElemAt: ["$participants", 0] }
        //     }
        // },
        // {
        //     "$project": {
        //         earnPoint: 1,
        //         // participants: 1,
        //         // sameRankCount: 1,

        //         profilePicture: "$rank.user.profilePicture",
        //         rank: "$rank.rank"
        //     }
        // },
        // {
        //     "$sort": {
        //         "earnPoint": -1
        //     }
        // }
    ]

    var taskPlayDB = getModelByShow(req.db, "taskplay", taskPlayModel);

    var aggregate = taskPlayDB.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    taskPlayDB.aggregatePaginate(aggregate, options, function (
        err,
        listdata,
        pageCount,
        count
    ) {
        if (err) {
            logger.error(`Error while list the tasks.`);
            res.status(400).json({
                apiName: "Ranking List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`Ranking has been listed successfully.`);
            res.json({
                apiName: "Ranking List API",
                success: true,
                message: "Successfully view ranking list",
                rankingList: listdata,
                // bannerRankingList: bannerRankingList,
                currentPage: req.query.page,
                totalPages: pageCount,
                dataCount: count,
            });
        }
    });
}