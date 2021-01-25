const admin = require("../shared-datas/fire-base.js");
const userModel = require("../models/users.js");

exports.userCheckAndCreate = (req, res) => {
  userModel.findOne({
      uid: req.query.uid,
    },
    function (err, user) {
      if (err) {
        res.status(400).send({
          apiName: "User Check API",
          success: false,
          message: "Some error occurred",
        });
      } else if (!user) {
        admin.firebase_admin
          .auth()
          .getUser(req.query.uid)
          .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            let userInfo = userRecord.toJSON();
            var userData = new userModel({
              uid: req.query.uid,
              name: userInfo.displayName,
              email: userInfo.email,
              mobile: userInfo.phoneNumber,
              profilePicture: userInfo.photoURL || null,
              status: 'active'
            });
            userData.save(function (err, savedData) {
              if (err) {
                res.status(400).send({
                  apiName: "User Check API",
                  success: false,
                  message: "Some error occurred",
                });
              } else {
                res.json({
                  apiName: "User Check API",
                  success: true,
                  message: "User profile created successfully.",
                });
              }
            });
          })
          .catch(function (error) {
            res.status(400).send({
              apiName: "User Check API",
              success: false,
              message: "Some error occurred",
            });
          });
      } else {
        res.json({
          apiName: "User Check API",
          success: true,
          message: "User found",
        });
      }
    }
  );
};

exports.userProfileUpdate = (req, res) => {
  var updateObject = {
    mobile: req.body.mobile,
    gender: req.body.gender,
    state: req.body.state,
    country: req.body.country,
    city: req.body.city,
    pincode: req.body.pincode,
    modifiedAt: new Date()
  };

  userModel.findOneAndUpdate(
    req._id, updateObject,
    function (err, savedData) {
      if (err) {
        res.status(400).json({
          apiName: "Contestant Update API",
          success: false,
          message: "Error Occurred",
        });
      } else {
        res.json({
          apiName: "Contestant Update API",
          success: true,
          message: "Contestant has been updated successfully.",
        });
      }
    });
}

exports.getMyProfile = (req, res) => {
  if (!req.uid) {
    return res.status(400).json({
      apiName: "Get Profile API",
      success: false,
      message: "Please provide user uid.",
    });
  }

  userModel.findOne({
    uid: req.uid
  }, function (err, userInfo) {
    if (err) {
      return res.status(400).json({
        apiName: "Get Profile API",
        success: false,
        message: "Some Error Occured",
      });
    } else if (!userInfo) {
      return res.status(400).json({
        apiName: "Get Profile API",
        success: false,
        message: "User not found",
      });
    } else {
      res.json({
        apiName: "Get Profile API",
        success: true,
        message: "Profile found successfully.",
        user: userInfo,
      });
    }
  });
};