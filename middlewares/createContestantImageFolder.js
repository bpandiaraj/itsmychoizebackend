const path = require("path");
const fs = require("fs");

module.exports = function (req, res, next) {
    var dirImage = './images/' + req.show;
    if (!fs.existsSync(dirImage)) {
        fs.mkdirSync(dirImage);
        dirImage = dirImage + '/contestant';
        if (!fs.existsSync(dirImage)) {
            fs.mkdirSync(dirImage);
            next();
        } else {
            next();
        }
    } else {
        next();
    }
}