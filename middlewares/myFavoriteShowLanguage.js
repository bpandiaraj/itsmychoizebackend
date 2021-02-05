const favoriteEventModel = require("../models/favorite_event");
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    masterDB
} = require("../config/config.js");

module.exports = function (req, res, next) {
    if (!req.show) {
        return res.status(400).json({
            apiName: "Show Check",
            success: false,
            message: "Please Provide Show ID",
        });
    }

  
    var favoriteEventDB = getModelByShow(masterDB, "favoriteEvent", favoriteEventModel);

    favoriteEventDB.findOne({
        user: req.id,
        event: req.show
    }, function (
        err,
        data
    ) {
        if (err) {
            return res.status(400).json({
                apiName: "Show Check",
                success: false,
                message: "Some Error Occured",
            });
        } else if(!data){
            req.eventLanguage = 'en'
            next();
        
        }else {
            req.eventLanguage = data.defaultLanguage || 'en'
            next();
        }
    });
}