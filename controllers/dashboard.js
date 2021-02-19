const userModel = require("../models/users.js");
const eventModel = require("../models/event.js");
const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");
const moment = require("moment");

exports.dashboardTileCounts = (req, res) => {
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  var query = [{
    "$group": {
      "_id": "_id",
      "total": { "$sum": 1 },
      "active_count": {
        "$sum": {
          "$cond": [{ "$eq": ["$status", "active"] }, 1, 0]
        }
      },
      "inactive_count": {
        "$sum": {
          "$cond": [{ "$eq": ["$status", "inactive"] }, 1, 0]
        }
      }
    }
  },
  {
    $project: {
      "_id": 0
    }
  }];
  var aggregate = userDB.aggregate(query);

  var options = {
    page: req.query.page || 1,
    limit: parseInt(req.query.limit) || 20,
  };

  userDB.aggregatePaginate(aggregate, options, function (
    err,
    listdata,
    pageCount,
    count
  ) {
    if (err) {
      res.json({
        apiName: "Users List API",
        success: false,
        message: "Some Error Occured",
      });
    } else {
      var eventDB = getModelByShow(config.masterDB, "event", eventModel);
      eventDB.findById(req.show, function (err, eventData) {
        if (err) {
          console.log("err", err);
          res.status(400).json({
            apiName: "Dashboard Data API",
            success: false,
            message: "Error Occurred",
          });
        } else if (!eventData) {
          res.json({
            apiName: "Dashboard Data API",
            success: true,
            message: "Dashboard Data founded.",
            totalDays: 0,
            remainingDays: 0,
            endDate: new Date(),
            total: listdata[0].total || 0,
            active_count: listdata[0].active_count || 0,
            inactive_count: listdata[0].inactive_count || 0,
          });
        } else {
          var startDate = moment(eventData.startedDate, "DD.MM.YYYY");
          var endDate = moment(eventData.endDate, "DD.MM.YYYY");
          var today = moment();
          var totalDays = endDate.diff(startDate, 'days');
          var remainingDays = today.diff(startDate, 'days');
          var endDateFormated = moment(endDate).format('DD-MM-YYYY')
          res.json({
            apiName: "Dashboard Data API",
            success: true,
            message: "Dashboard Data founded.",
            totalDays: totalDays || 0,
            remainingDays: remainingDays || 0,
            endDate: endDateFormated || new Date(),
            total: listdata[0].total || 0,
            active_count: listdata[0].active_count || 0,
            inactive_count: listdata[0].inactive_count || 0,
          });
        }
      });
    }
  });
};