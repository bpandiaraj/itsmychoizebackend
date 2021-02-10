const path = require("path");
const fs = require("fs");

module.exports = function (req, res, next) {
    var dirImage = './images/' + req.show;
    if (!fs.existsSync(dirImage)) {
        fs.mkdirSync(dirImage);
        dirImage = dirImage + '/contestant';
        dirImage1 = dirImage + '/task';
        if (!fs.existsSync(dirImage)) {
            fs.mkdirSync(dirImage);
        } else {
        }
        if (!fs.existsSync(dirImage1)) {
            fs.mkdirSync(dirImage1);
        } else {
        }
        setTimeout(() => {
            next();
        }, 500);
    } else {
        next();
    }
}