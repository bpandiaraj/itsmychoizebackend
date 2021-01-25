const {
    text
} = require("body-parser");
const contestants = require("../models/contestants.js");
const constant = require("../util/constant.json")
const formidable = require("formidable");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

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

    var aggregate = contestants.aggregate(arr);

    var options = {
        page: req.query.page || 1,
        limit: parseInt(req.query.limit) || 200,
    };

    contestants.aggregatePaginate(aggregate, options, function (
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
                list: listdata,
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
            var body = JSON.parse(fields.contestantInfo);
            console.log("body", body);
            var contestantsData = new contestants({
                name: body.name,
                biography: body.biography,
                professional: body.professional,
                status: "active",
                createdAt: new Date(),
                modifiedAt: null,
            });
            console.log("contestantsData", contestantsData);

            contestantsData.save(function (err, savedData) {
                if (err) {
                    res.status(400).json({
                        apiName: "Contestant Create API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    console.log("saved", savedData)
                    saveImages('create', savedData, files, res);
                    // res.json({
                    //     apiName: "Contestant Create API",
                    //     success: true,
                    //     message: "Contestant has been saved successfully.",
                    //     id: savedData._doc._id,
                    // });
                }
            });
        }
    })
}

function saveImages(t, data, files, res) {
    if (files.image != undefined) {
        let newpath = `./images/biggboss_tamil/contestant`;
        console.log("files.image.path", files.image.path)
        fs.rename(files.image.path, newpath + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim(), (err) => {
            if (err) {
                console.log("err", err)
            } else {
                contestants.findOneAndUpdate(
                    data._doc._id, {
                        images: [newpath + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim()]
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


    var contestantsData = {
        name: req.body.name,
        biography: req.body.biography,
        professional: req.body.professional,
        status: "active",
        createdAt: new Date(),
        modifiedAt: null,
    };

    contestants.findByIdAndUpdate(req.query.id, contestantsData, function (err, savedData) {
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

exports.contestantsDelete = function (req, res) {

}