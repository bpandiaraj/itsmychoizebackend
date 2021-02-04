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

mongoose.Promise = global.Promise;

app.set('superSecret', constant.superSecret);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(morgan("combined", {
    stream: logger.stream
  }));
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
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

var dirImage = './images';
if (!fs.existsSync(dirImage)){
    fs.mkdirSync(dirImage);
}

require('./routes/route')(app);

app.listen(port, () => {
    console.log("Server listening on port " + port);
});