const task = require("../models/task.js");
const ObjectId = require("mongodb").ObjectID;
const {
    getModelByShow
} = require("../config/db_connection.js");
const {
    masterDB
} = require("../config/config.js");
var logger = require("../config/logger");

exports.createTask = function (req, res) {

}