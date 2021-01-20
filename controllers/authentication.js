// const userModel = require("../models/users.js");
const adminModel = require("../models/admin.js");
const constant = require("../util/constant.json")

exports.adminLogin = function (req, res) {
    adminModel.findOne({
        userName: req.body.userName
    }, ).lean().exec(function (err, user) {
        console.log("userId:", user);

        if (err) {
            return res.status(401).json({
                "APIName": constant.apiNameUserlogin,
                "isError": true,
                "message": constant.apiErrorNotAuthenticated
            });
        }

        if (!user) {
            return res.status(401).json({
                "APIName": constant.apiNameUserlogin,
                "isError": true,
                "message": constant.apiErrorNoUser
            });
        }

        if (req.body.password != user.password) {
            return res.status(401).json({
                "APIName": constant.apiNameUserlogin,
                "isError": true,
                "message": constant.apiErrorInvalidPassword
            });
        }

        let token = jwt.sign(user, app.get('superSecret'), {
            expiresIn: "8h" // expires in 8 hour
        });

        return res.json({
            "APIName": constant.apiNameUserlogin,
            "isError": false,
            "message": constant.apiLoginSuccess,
            "token": token,
            "_id": user._id,
            "email": user.email,
            "createdTimestamp": user.createdTimestamp
        });
    });
}

exports.landingList = function (req, res) {

}