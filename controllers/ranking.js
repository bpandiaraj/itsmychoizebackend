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
        },
        // { // push all documents, sorted, into an array
        //     $group: {
        //         _id: "",
        //         rankings: {
        //             $push: "$$ROOT"
        //         }
        //     }
        // },
        // { // unwind the formed array back into separate documents, but pass the index
        //     $unwind: {
        //         path: "$rankings",
        //         includeArrayIndex: "rank"
        //     }
        // },
        // {
        //     "$project": {
        //         "_id": 0,
        //         "participants": "$rankings.participants",
        //         "earnPoint": "$rankings.earnPoint",
        //         "rank": 1,
        //         "sameRankCount": { $size: "$rankings.participants" }
        //     }
        // }
        // {
        //     "$project": {
        //         "user": "$_id.user",
        //         "_id": 0,
        //         "earnPoint": 1,
        //         "tasks": 1
        //     }
        // },
        // {
        //     "$group": {
        //         _id: {
        //             earnPoint: "$earnPoint"
        //         },
        //         sameRanking: { "$sum": 1 },
        //         participants: {
        //             "$push": {
        //                 user: "$user",
        //                 task: "$task"
        //             }
        //         }
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
            var bannerRankingList = [];
            for (let i = 0; i < 3; i++) {
                bannerRankingList.push(listdata[i]);
            }
            listdata.splice(0, 3);
            res.json({
                apiName: "Ranking List API",
                success: true,
                message: "Successfully view ranking list",
                rankingList: listdata,
                bannerRankingList: bannerRankingList,
                currentPage: req.query.page,
                totalPages: pageCount,
                dataCount: count,
            });
        }
    });
};