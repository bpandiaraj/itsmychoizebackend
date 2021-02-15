const favoriteModel = require("../models/favorite");
const { getModelByShow } = require("../config/db_connection.js");

module.exports = function (req, res, next) {

    var favoriteDB = getModelByShow(req.db, "favorite", favoriteModel);

    console.log("id", req.id, "show", req.show)
    favoriteDB.findOne({
        user: req.id,
        event: req.show
    }, function (
        err,
        data
    ) {

        console.log("data", data)
        if (err) {
            return res.status(400).json({
                apiName: "Show Check",
                success: false,
                message: "Some Error Occured",
            });
        } else if (!data) {
            req.favoriteContestant = [];
            next();
        } else {
            req.favoriteContestant = data.contestants || [];
            next();
        }
    });
}