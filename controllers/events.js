const eventModel = require("../models/event.js");
const favoriteModel = require("../models/favorite.js");
const favoriteEventModel = require("../models/favorite_event.js");
const ObjectId = require("mongodb").ObjectID;
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    masterDB, db
} = require("../config/config.js");
var logger = require("../config/logger");

exports.eventInfo = async function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Event Detail API",
            success: false,
            message: "Please provide the Event ID to get the Event information.",
        });
    }

    var eventDB = getModelByShow(req.db, "event", eventModel);

    eventDB.findById(req.query.id, function (err, contestantData) {
        if (err) {
            console.log("err", err);
            res.status(400).json({
                apiName: "eventDB Detail API",
                success: false,
                message: "Error Occurred",
            });
        } else if (!eventData) {
            res.status(400).json({
                apiName: "eventDB Detail API",
                success: false,
                message: "eventDB not found.",
            });
        } else {
            console.log(eventData);

            var language = req.query.language || req.eventLanguage;

            if (language != 'en' && language != 'both' && language != req.nativeLanguage) {
                language = 'en';
            }
            var translation;
            var event = eventData._doc;

            if (language) {
                if (language == 'both') {
                    translation = {
                        ...event.translation,
                        en: {
                            name: event.name,
                            rules: event.rules,
                            description: event.description,
                        }
                    }
                    event.translation = translation;
                    event = {
                        ...event,
                        nativeLanguage: req.nativeLanguage
                    }
                } else if (language != 'en') {
                    var trans = event.translation;
                    event = {
                        ...event,
                        nativeLanguage: req.nativeLanguage,
                        name: trans[language].name,
                        rules: trans[language].rules,
                        description: trans[language].description,
                        translation: null
                    }
                    delete event.translation;
                } else {
                    event = event;
                    delete event.translation;
                }
            }

            res.json({
                apiName: "Event Detail API",
                success: true,
                message: "Event has been updated successfully.",
                data: event
            });
        }
    });
}

exports.getEventList = async function (req, res) {
    var eventDB = await getModelByShow(masterDB, "event", eventModel);
    var search = req.body.search;

    var language = req.query.language ;
    // console.log(language,req.nativeLanguage)
    // if (language != 'en' && language != 'both' && language != req.nativeLanguage) {
    //     language = 'en';
    // }

    // console.log("language",language,req.eventLanguage,req.nativeLanguage)

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

    if (req.query.status) {
        if (req.query.status != 'all') {
            arr.push({
                $match: {
                    status: req.query.status,
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
                        "rules": "$rules",
                        "description": "$description"
                    },
                //    / "nativeLanguage": req.nativeLanguage
                }
            })
        } else if (language != 'en') {
            arr.push({
                $addFields: {
                    "name": `$translation.name`,
                    "rules": `$translation.rules`,
                    "description": `$translation.description`,
                },
            })
        } else {
            arr.push({
                $project: {
                    "translation": 0
                },
            })
        }
    } else {
        arr.push({
            $project: {
                "translation": 0
            },
        })
    }

    // arr.push({
    //     $lookup: {
    //         from: "languages",
    //         localField: "language",
    //         foreignField: "language",
    //         as: "language",
    //     }
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
    console.log("req.body", req.body)
    if (!req.body.event) {
        return res.status(400).json({
            apiName: "Event Favorite API",
            success: false,
            message: "Please provide event id.",
        });
    }

    eventDB.findOne({
        user: req.id,
        event: req.body.event
    }, function (err, eventInfo) {
        if (err) {
            return res.status(400).json({
                apiName: "Event Favorite API",
                success: false,
                message: "Error Occurred",
            });
        } else if (eventInfo) {
            var eventDataForUpdate = {
                defaultLanguage: req.body.defaultLanguage || eventInfo.defaultLanguage,
                defaulted: req.body.defaulted || eventInfo.defaulted,
            };
            eventDB.findByIdAndUpdate(eventInfo._id, eventDataForUpdate, function (err, savedData) {
                console.log(err);
                if (err) {
                    res.status(400).json({
                        apiName: "Event Favorite API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    var dbId = db + '_' + req.body.event;
                    var favoriteDB = getModelByShow(dbId, "favorite", favoriteModel);
                    favoriteDB.findOne({
                        user: req.id
                    }, function (err, favoriteContestant) {
                        console.log("favorite", favoriteContestant)
                        if (err) {
                            res.status(400).json({
                                apiName: "Event Favorite API",
                                success: false,
                                message: "Error Occurred",
                            });
                        } else if (favoriteContestant) {
                            if (favoriteContestant.contestants) {
                                res.json({
                                    apiName: "Event Favorite API",
                                    success: true,
                                    message: "User already saved this event.",
                                    defaultLanguage: req.body.defaultLanguage || savedData.defaultLanguage,
                                    defaulted: req.body.defaulted || savedData.defaulted,
                                    contestantFavorited: true
                                });
                            } else {
                                res.json({
                                    apiName: "Event Favorite API",
                                    success: true,
                                    message: "User already saved this event.",
                                    defaultLanguage: req.body.defaultLanguage || savedData.defaultLanguage,
                                    defaulted: req.body.defaulted || savedData.defaulted,
                                    contestantFavorited: false
                                });
                            }
                        } else {
                            res.json({
                                apiName: "Event Favorite API",
                                success: true,
                                message: "User already saved this event.",
                                defaultLanguage: req.body.defaultLanguage || savedData.defaultLanguage,
                                defaulted: req.body.defaulted || savedData.defaulted,
                                contestantFavorited: false
                            });
                        }
                    })
                }
            });
        } else {
            console.log("req.body", req.body);
            var eventData = new eventDB({
                user: req.id,
                event: req.body.event,
                defaultLanguage: req.body.defaultLanguage || null,
                defaulted: req.body.defaulted || false,
                createdAt: new Date(),
            });

            eventData.save(function (err, savedData) {
                if (err) {
                    res.status(400).json({
                        apiName: "Event Favorite API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    res.json({
                        apiName: "Event Favorite API",
                        success: true,
                        message: "Event has been favorited",
                        defaultLanguage: savedData.defaultLanguage || null,
                        defaulted: savedData.defaulted || false,
                        contestantFavorited: false
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

exports.eventCreate = function (req, res) {
    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.maxFileSize = 10 * 1024 * 1024;
    form.keepExtensions = true;
    form.uploadDir = path.join(__dirname, "../images/");
    form.parse(req, async (err, fields, files) => {
        if (err) {
            logger.error(`Error while event creates.`);
            res.status(400).json({
                apiName: "Event Create API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            var body = JSON.parse(fields.eventInfo);

            if (!body.name || !body.language) {
                logger.error(`Data not found.`);
                return res.status(400).json({
                    apiName: "Event Create API",
                    success: false,
                    message: "Please provide the event information.",
                });
            }

            var eventData = getModelByShow(req.db, "event", eventModel);
            var translation = {}
            translation[req.nativeLanguage] = {
                ...body.translation
            };

            var eventInfo = new eventData({
                name: body.name,
                language: body.language,
                status: body.status,
                createdAt: new Date(),
                modifiedAt: null,
                translation: translation
            });
            eventInfo.save(function (err, savedData) {
                console.log(err)
                if (err) {
                    logger.error(`Error while list the Event.`);
                    res.status(400).json({
                        apiName: "Event Create API",
                        success: false,
                        message: "Error Occurred",
                    });
                } else {
                    logger.info(`Event created and image will save.`);
                    saveImages('create', savedData, files, res, req, eventData);
                }
            });
        }
    })
}

function saveImages(t, data, files, res, req, db) {
    if (files.image != undefined && files.banner != undefined) {
        let newpath = `./images/shows`;
        let newpath1 = `/shows`;
        fs.rename(files.image.path, newpath + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim(), (err) => {
            if (err) {
                logger.error(`Error while save image of event.`);
                console.log("err", err);
            } else {
                fs.rename(files.banner.path, newpath + "/banner_" + data._doc._id + "." + files.image.path.split(".").pop().trim(), (err) => {
                    if (err) {
                        logger.error(`Error while save image of event.`);
                        console.log("err", err);
                    } else {
                        db.findByIdAndUpdate(
                            data._doc._id,
                            {
                                logo: newpath1 + "/" + data._doc._id + "." + files.image.path.split(".").pop().trim(),
                                banner: newpath1 + "/banner_" + data._doc._id + "." + files.image.path.split(".").pop().trim(),
                                databaseId: data._doc._id
                            },
                            function (err, savedData) {
                                if (err) {
                                    logger.error(`Error while update the image url in event collection.`);
                                    res.status(400).json({
                                        apiName: "Event Create API",
                                        success: false,
                                        message: "Error Occurred",
                                    });
                                } else {
                                    logger.info(`Event image url updated successfully.`);
                                    res.json({
                                        apiName: "Show Create API",
                                        success: true,
                                        message: "Event has been saved successfully.",
                                        id: data._doc._id,
                                    });
                                }
                            })
                    }
                });
            }
        });
    } else {
        logger.info(`Event detail has been saved and image not uploaded`);
        res.json({
            apiName: "Event Create API",
            success: true,
            message: "Event has been saved successfully without image.",
            id: data._doc._id,
        });
    }
}

exports.eventImageUpdate = function (req, res) {
    if (!req.query.id) {
        return res.status(400).json({
            apiName: "Event Create API",
            success: false,
            message: "Please provide the event ID to update.",
        });
    }

    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.maxFileSize = 10 * 1024 * 1024;
    form.keepExtensions = true;
    form.uploadDir = path.join(__dirname, "../images/");
    form.parse(req, async (err, fields, files) => {
        if (err) {
            logger.error(`Error while event creates.`);
            res.status(400).json({
                apiName: "Event Create API",
                success: false,
                message: "Error Occurred",
            });
        } else {
            var body = JSON.parse(fields.eventInfo);
            console.log("body", body);

            if (!body.name || !body.language) {
                logger.error(`Data not found.`);
                return res.status(400).json({
                    apiName: "Event Create API",
                    success: false,
                    message: "Please provide the event information.",
                });
            }

            var translation = {}
            translation[req.nativeLanguage] = {
                ...body.translation
            };

            var eventsDataToSave = {
                name: body.name,
                language: body.language,
                status: body.status,
                createdAt: new Date(),
                modifiedAt: null,
                translation: translation
            };

            var eventData = getModelByShow(req.db, "event", eventModel);
            eventData.findByIdAndUpdate(req.query.id, eventsDataToSave, function (err, savedData) {
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
                    fs.unlink("./images/" + savedData.images[0], (err) => {
                        if (err) {
                            console.error(err)
                        }
                        updateImages('create', body.imageChanged, files, res, req, eventData);
                    })
                }
            });
        }
    })
}

function updateImages(t, data, files, res, req, db) {
    if (data) {
        console.log("image", files.image)
        if (files.image != undefined) {
            let newpath = `./images/shows`;
            let newpath1 = `/shows`;
            let savedDate = moment().startOf('day').format("YMMDDHHmmss");
            console.log("savedDate", savedDate)
            fs.rename(files.image.path, newpath + "/" + req.query.id + '_' + savedDate + "." + files.image.path.split(".").pop().trim(), (err) => {
                if (err) {
                    logger.error(`Error while save image of contestants.`);
                    console.log("err", err);
                } else {
                    db.findByIdAndUpdate(
                        req.query.id, {
                        logo: newpath1 + "/" + req.query.id + '_' + savedDate + "." + files.image.path.split(".").pop().trim(),
                        databaseId: req.query.id
                    },
                        function (err, savedData) {
                            if (err) {
                                logger.error(`Error while update the image url in event collection.`);
                                res.status(400).json({
                                    apiName: "Event Create API",
                                    success: false,
                                    message: "Error Occurred"
                                });
                            } else {
                                logger.info(`Event image url updated successfully.`);
                                res.json({
                                    apiName: "Event Create API",
                                    success: true,
                                    message: "Event has been updated successfully."
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
}