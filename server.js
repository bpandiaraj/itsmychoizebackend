var express = require("express");
var app = express();
var port = 3250;
var mongoose = require("mongoose");
var bodyParser = require('body-parser');
var nodemon = require('nodemon');
var constant = require("./util/constant")

mongoose.set('useCreateIndex', true)
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/it-my-choize", {
    useNewUrlParser: true
})
app.set('superSecret', constant.superSecret);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/", (req, res) => {
    res.send("Hello World");
});

mongoose.connection.on('error', function () {
    console.log("Could not connect to Database.. Exiting Now...")
    process.exit();
})

mongoose.connection.once('open', function () {
    console.log("Database Connected.")
})
require('./routes/route')(app);

process
    // Handle normal exits
    .on('exit', (code) => {
        nodemon.emit('quit');
        process.exit(code);
    })

    // Handle CTRL+C
    .on('SIGINT', () => {
        nodemon.emit('quit');
        process.exit(0);
    });

app.listen(port, () => {
    console.log("Server listening on port " + port);
});