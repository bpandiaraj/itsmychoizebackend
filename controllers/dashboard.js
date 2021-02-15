const userModel = require("../models/users.js");
const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const logger = require("../config/logger");

exports.userCount = (req, res) => {
  var userDB = getModelByShow(config.masterDB, "user", userModel);

};