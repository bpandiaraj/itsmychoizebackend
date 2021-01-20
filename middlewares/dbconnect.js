var mongoose = require('mongoose');

global.connections = {};

exports.getDatabaseConnection = function (dbName) {
    if (connections[dbName]) {
        return connections[dbName];
    } else {
        connections[dbName] = mongoose.createConnection('mongodb://localhost:27017/' + dbName, {
            useNewUrlParser: true
        });
        return connections[dbName];
    }
}