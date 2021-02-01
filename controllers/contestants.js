const contestants = require("../models/contestants.js");
const formidable = require("formidable");
const constant = require("../util/constant.json")
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const {
    getModelByShow
} = require("../config/db_connection.js");

exports.contestantsList = function (req, res) {
    var search = req.body.search;
    var arr = [];
    if (search) {
        arr.push({
            $match: {
                $or: [{
                        name: {
                            $regex: search,
                            $options: "i",
                        },
                    },
                    {
                        professional: {
                            $regex: search,
                            $options: "i",
                        },
                    },
                    {
                        biography: {
                            $regex: search,
                            $options: "i",
                        },
                    },
                ],
            },
        });
    }

    var contestantModel = getModelByShow(req.db, "contestant", contestants)

    var aggregate = contestantModel.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    contestantModel.aggregatePaginate(aggregate, options, function (
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
                currentPage: req.query.page,
                totalPages: pageCount,
                dataCount: count,
            });
        }
    });
};

exports.contestantsCreate = function (req, res) {
    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.maxFileSize = 10 * 1024 * 1024;
    form.keepExtensions = true;
    form.uploadDir = path.join(__dirname, "../images/");
    form.parse(req, async (err, fields, files) => {
        if (err) {
            res.status(400).json({
                apiName: "Contestant Create API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            console.log(fields.contestantInfo)
            var body = JSON.parse(fields.contestantInfo);
            console.log("body", body);
            var contestantModel = getModelByShow(req.db, "contestant", contestants);
            var translation = {}
            translation[req.nativeLanguage] = {
                ...body.translation
            };

            var contestantsData = new contestantModel({
                name: body.name,
                biography: body.biography,
                professional: body.professional,
                status: body.status,
                createdAt: new Date(),
                modifiedAt: null,
                translation: translation
            });
            console.log("contestantsData", contestantsData);

            contestantsData.save(function (err, savedData) {
                console.log(err)
                if (err) {
                    res.status(400).json({
                        apiName: "Contestant Create API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    console.log("saved", savedData)
                    saveImages('create', savedData, files, res, contestantModel);
                }
            });
        }
    })
}

function saveImages(t, data, files, res, db) {
    if (files.image != undefined) {
        let newpath = `./images/biggboss_tamil/contestant`;
        let newpath1 = `/biggboss_tamil/contestant`;
        console.log("files.image.path", files.image.path)
        fs.rename(files.image.path, newpath + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim(), (err) => {
            if (err) {
                console.log("err", err)
            } else {
                db.findByIdAndUpdate(
                    data._doc._id, {
                        images: [newpath1 + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim()]
                    },
                    function (err, savedData) {
                        if (err) {
                            res.status(400).json({
                                apiName: "Contestant Create API",
                                success: false,
                                message: "Error Occurred",
                            });
                        } else {
                            res.json({
                                apiName: "Contestant Create API",
                                success: true,
                                message: "Contestant has been saved successfully.",
                                id: data._doc._id,
                            });
                        }
                    })
            }
        });
    } else {
        res.json({
            apiName: "Contestant Create API",
            success: true,
            message: "Contestant has been saved successfully.",
            id: data._doc._id,
        });
    }
}


exports.contestantsUpdate = function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Contestant Create API",
            success: false,
            message: "Please provide the contestant ID to update.",
        });
    }

    var translation = {}
    translation[req.nativeLanguage] = {
        ...req.body.translation
    };
    var contestantsData = {
        name: req.body.name,
        biography: req.body.biography,
        professional: req.body.professional,
        status:  req.body.status,
        modifiedAt: new Date(),
        translation: translation
    };
    var contestantModel = getModelByShow(req.db, "contestant", contestants)
    contestantModel.findByIdAndUpdate(req.query.id, contestantsData, function (err, savedData) {
        if (err) {
            res.status(400).json({
                apiName: "Contestant Update API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            res.json({
                apiName: "Contestant Update API",
                success: true,
                message: "Contestant has been updated successfully.",
            });
        }
    });
}

exports.contestantsDelete = function (req, res) {}

exports.contestantsStatus = function (req, res) {}

exports.contestantsDetails = function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Contestant Detail API",
            success: false,
            message: "Please provide the contestant ID to get the contestant bio-data.",
        });
    }
    var contestantModel = getModelByShow(req.db, "contestant", contestants);
    contestantModel.findById(req.query.id, function (err, contestantData) {
        if (err) {
            res.status(400).json({
                apiName: "Contestant Detail API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            res.json({
                apiName: "Contestant Detail API",
                success: true,
                message: "Contestant has been updated successfully.",
                data: contestantData
            });
        }
    });
}