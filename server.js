var express = require("express");
var app = express();
var port = 3250;
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var nodemon = require('nodemon');
var constant = require("./util/constant")
var logger = require("./config/logger");
var morgan = require("morgan");
var fs = require('fs');
var { makeUserInactive } = require("./cron/userInvalidate.js");
var { makeTaskActiveAndInactive } = require("./cron/makeTaskActive.js");

mongoose.Promise = global.Promise;

app.set('superSecret', constant.superSecret);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(morgan("combined", { stream: logger.stream }));
app.use(express.static('images'));
app.get("/", (req, res) => {
    res.send("Welcome to Its My Choize......");
});


/** 
 * Folder creation
 * 1. Log File
 * 2. For Image save
 * */

var dir = './logs';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

var dirImage = './images';
if (!fs.existsSync(dirImage)) {
    fs.mkdirSync(dirImage);
}

//For call crons events
makeUserInactive();
// makeTaskActiveAndInactive('2021-02-20T12:09:00.000+05:30','2021-02-21T20:19:04.000+00:00','602397875420f02e60225dad','60124dcfd12b8626d8d3df04','its_my_choize_60124dcfd12b8626d8d3df04')

require('./routes/route')(app);

app.listen(port, () => {
    console.log("Server listening on port " + port);
});