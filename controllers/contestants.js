const contestants = require("../models/contestants.js");
const formidable = require("formidable");
const constant = require("../util/constant.json")
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");

exports.contestantsList = function (req, res) {
    var search = req.query.search;
    var language = req.query.language || req.eventLanguage;

    if (language != 'en' && language != 'both' && language != req.nativeLanguage) {
        language = 'en';
    }

    var rules;
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

    if (req.query.status) {
        if (req.query.status != 'all') {
            arr.push({
                $match: {
                    status: req.query.status
                },
            });

        }
    } else {
        arr.push({
            $match: {
                status: 'active'
            },
        });
    }

    if (language) {
        if (language == 'both') {
            arr.push({
                $addFields: {
                    "translation.en": {
                        "name": "$name",
                        "biography": "$biography",
                        "professional": "$professional"
                    },
                    "nativeLanguage": req.nativeLanguage
                }
            })
        } else if (language != 'en') {
            arr.push({
                $addFields: {
                    "name": `$translation.${language}.name`,
                    "biography": `$translation.${language}.biography`,
                    "professional": `$translation.${language}.professional`,
                    // "nativeLanguage": req.nativeLanguage
                },
            })
            arr.push({
                $project: {
                    "translation": 0
                },
            })
            rules = req.eventInformation.translation.rules || '';
        } else {
            arr.push({
                $project: {
                    "translation": 0
                },
            })
            rules = req.eventInformation.rules || '';

        }
    } else {
        arr.push({
            $project: {
                "translation": 0
            },
        })
    }

    arr.push({
        $sort: {
            status: 1
        },
    });

    console.log("array", req.favoriteContestant)
    if (Array.isArray(req.favoriteContestant)) {
        arr.push({
            $addFields: {
                "isFavorited": { $cond: { if: { "$in": ["$_id", req.favoriteContestant] }, then: true, else: false } }
            }
        })
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
            console.log(err);
            logger.error(`Error while list the contestants.`);
            res.status(400).json({
                apiName: "Contestant List API",
                success: false,
                message: "Some Error Occured",
            });
        } else {
            logger.info(`Contestant has been favorited successfully.`);
            res.json({
                apiName: "Contestant List API",
                success: true,
                message: "Successfully view Contestant list",
                contestantList: listdata,
                currentPage: req.query.page,
                totalPages: pageCount,
                dataCount: count,
                maxSelecteContestant: req.configure.maxFavoriteContestant || 5,
                rules: rules
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
            logger.error(`Error while contestant creates.`);
            res.status(400).json({
                apiName: "Contestant Create API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            console.log(fields.contestantInfo)
            var body = JSON.parse(fields.contestantInfo);
            console.log("body", body);

            if (!body.name || !body.biography || !body.professional || !body.status || !body.translation) {
                logger.error(`Data not found.`);
                return res.status(400).json({
                    apiName: "Contestant Create API",
                    success: false,
                    message: "Please provide the contestant information.",
                });
            }

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
            contestantsData.save(function (err, savedData) {
                console.log(err)
                if (err) {
                    logger.error(`Error while list the contestants.`);
                    res.status(400).json({
                        apiName: "Contestant Create API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    logger.info(`Contestant created and image will save.`);
                    saveImages('create', savedData, files, res, req, contestantModel);
                }
            });
        }
    })
};

function saveImages(t, data, files, res, req, db) {
    if (files.image != undefined) {
        let newpath = `./images/${req.show}/contestant`;
        let newpath1 = `/${req.show}/contestant`;
        console.log("files.image.path", files.image.path)
        fs.rename(files.image.path, newpath + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim(), (err) => {
            if (err) {
                logger.error(`Error while save image of contestants.`);
                console.log("err", err);
            } else {
                db.findByIdAndUpdate(
                    data._doc._id, {
                    images: [newpath1 + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim()]
                },
                    function (err, savedData) {
                        if (err) {
                            logger.error(`Error while update the image url in contestant collection.`);
                            res.status(400).json({
                                apiName: "Contestant Create API",
                                success: false,
                                message: "Error Occurred",
                            });
                        } else {
                            logger.info(`Contestant image url updated successfully.`);
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
        logger.info(`Contestant detail has been saved and image not uploaded`);
        res.json({
            apiName: "Contestant Create API",
            success: true,
            message: "Contestant has been saved successfully.",
            id: data._doc._id,
        });
    }
};

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
        status: req.body.status,
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
};

exports.contestantsImageUpdate = function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Contestant Create API",
            success: false,
            message: "Please provide the contestant ID to update.",
        });
    }

    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.maxFileSize = 10 * 1024 * 1024;
    form.keepExtensions = true;
    form.uploadDir = path.join(__dirname, "../images/");
    form.parse(req, async (err, fields, files) => {
        if (err) {
            logger.error(`Error while contestant creates.`);
            res.status(400).json({
                apiName: "Contestant Create API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            var body = JSON.parse(fields.contestantInfo);
            console.log("body", body);

            if (!body.name || !body.biography || !body.professional || !body.status || !body.translation) {
                logger.error(`Data not found.`);
                return res.status(400).json({
                    apiName: "Contestant Create API",
                    success: false,
                    message: "Please provide the contestant information.",
                });
            }

            var translation = {};
            translation[req.nativeLanguage] = {
                ...body.translation
            };
            var contestantsData = {
                name: body.name,
                biography: body.biography,
                professional: body.professional,
                status: body.status,
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
                } else if (!savedData) {
                    res.status(400).json({
                        apiName: "Contestant Update API",
                        success: false,
                        message: "Contestant info not found.",
                    });
                } else {
                    console.log("savedData", savedData);

                    if (!body.imageChanged) {
                        updateImages('create', body.imageChanged, files, res, req, contestantModel);
                    } else {
                        fs.unlink("./images/" + savedData.images[0], (err) => {
                            if (err) {
                                console.error(err)
                            }
                            updateImages('create', body.imageChanged, files, res, req, contestantModel);
                        })
                    }
                }
            });
        }
    })
};

function updateImages(t, data, files, res, req, db) {
    console.log("data.imageChanged", data)
    if (data) {
        console.log("image", files.image)
        if (files.image != undefined) {
            let newpath = `./images/${req.show}/contestant`;
            let newpath1 = `/${req.show}/contestant`;
            let savedDate = moment().startOf('day').format("YMMDDHHmmss");
            console.log("savedDate", savedDate)
            fs.rename(files.image.path, newpath + "/" + req.query.id + '_' + savedDate + "." + files.image.path.split(".").pop().trim(), (err) => {
                if (err) {
                    logger.error(`Error while save image of contestants.`);
                    console.log("err", err);
                } else {
                    db.findByIdAndUpdate(
                        req.query.id, {
                        images: [newpath1 + "/" + req.query.id + '_' + savedDate + "." + files.image.path.split(".").pop().trim()]
                    },
                        function (err, savedData) {
                            if (err) {
                                logger.error(`Error while update the image url in contestant collection.`);
                                res.status(400).json({
                                    apiName: "Contestant Create API",
                                    success: false,
                                    message: "Error Occurred"
                                });
                            } else {
                                logger.info(`Contestant image url updated successfully.`);
                                res.json({
                                    apiName: "Contestant Create API",
                                    success: true,
                                    message: "Contestant has been updated successfully."
                                });
                            }
                        })
                }
            });
        } else {
            logger.info(`Contestant detail has been update and image not updated`);
            res.json({
                apiName: "Contestant Update API",
                success: true,
                message: "Contestant has been updated successfully."
            });
        }
    } else {
        logger.info(`Contestant detail has been update and image not updated`);
        res.json({
            apiName: "Contestant Update API",
            success: true,
            message: "Contestant has been updated successfully."
        });
    }
};

exports.contestantsDelete = function (req, res) {

};

exports.contestantsStatus = function (req, res) {
    var contestantModel = getModelByShow(req.db, "contestant", contestants);
    contestantModel.findOneAndUpdate(
        { _id: req.query.id },
        { status: req.body.status },
        function (err, savedData) {
            if (err) {
                res.status(400).json({
                    apiName: "Contestant Status Update API",
                    success: false,
                    message: "Error Occurred",
                });
            } else {
                res.json({
                    apiName: "Contestant Status Update API",
                    success: true,
                    message: `Contestant status has been updated as ${req.body.status}.`,
                });
            }
        });
};

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
            console.log("err", err);
            res.status(400).json({
                apiName: "Contestant Detail API",
                success: false,
                message: "Error Occurred",
            });
        } else if (!contestantData) {
            res.status(400).json({
                apiName: "Contestant Detail API",
                success: false,
                message: "Contestant not found.",
            });
        } else {
            console.log(contestantData);

            var language = req.query.language || req.eventLanguage;

            if (language != 'en' && language != 'both' && language != req.nativeLanguage) {
                language = 'en';
            }
            var translation;
            var contestant = contestantData._doc;

            if (language) {
                if (language == 'both') {
                    translation = {
                        ...contestant.translation,
                        en: {
                            name: contestantData.name,
                            biography: contestantData.biography,
                            professional: contestantData.professional,
                        }
                    }
                    contestant.translation = translation;
                    contestant = {
                        ...contestant,
                        nativeLanguage: req.nativeLanguage
                    }
                } else if (language != 'en') {
                    var trans = contestant.translation;
                    contestant = {
                        ...contestant,
                        nativeLanguage: req.nativeLanguage,
                        name: trans[language].name,
                        biography: trans[language].biography,
                        professional: trans[language].professional,
                        translation: null
                    }
                    delete contestant.translation;
                } else {
                    contestant = contestant;
                    delete contestant.translation;
                }
            }

            res.json({
                apiName: "Contestant Detail API",
                success: true,
                message: "Contestant has been updated successfully.",
                data: contestant
            });
        }
    });
};