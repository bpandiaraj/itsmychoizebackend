var jwt = require('jsonwebtoken');
// let User = require('../models/users');
var express = require("express");
var app = express();
var constant = require("../util/constant")
app.set('superSecret', constant.superSecret);

module.exports = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        // verifies secret and checks exp
        // jwt.verify(token, app.get('superSecret'), function (err, decoded) {
        //     if (err) { //failed verification.
        //         return res.status(401).send({
        //             "APIName": constant.apiNameToken,
        //             "isError": true,
        //             "message": constant.apiErrorTokenExpired
        //         });
        //     }
        //     // req.decoded = decoded;
        //     global.userId = decoded._id;

        //     console.log("userId:", userId);

        //     User.findById(userId, function (err, user) {
        //         if (err) {
        //             return res.status(401).send({

        //                 "APIName": constant.apiNameToken,
        //                 "isError": true,
        //                 "message": constant.apiErrorNoUser
        //                 // }
        //             });
        //         }
        //         if (!user) {
        //             return res.status(401).send({
        //                 "APIName": constant.apiNameToken,
        //                 "isError": true,
        //                 "message": constant.apiErrorNoToken
        //             });
        //         }

        //         console.log("user:", user);
        //         // Do something with the user
        //         next(); //no error, proceed
        //     });
        // });
    } else {
        // forbidden without token
        return res.status(403).send({

            "APIName": constant.apiNameToken,
            "isError": true,
            "message": constant.apiErrorForbidden
            // }
        });
    }
}