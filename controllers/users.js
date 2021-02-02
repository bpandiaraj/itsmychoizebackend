const userModel = require("../models/users.js");
const config = require("../config/config.js");
const {
  getModelByShow
} = require("../config/db_connection.js");
const {
  admin
} = require("../shared-datas/fire-base.js");
var logger = require("../config/logger");

exports.userCheckAndCreate = (req, res) => {
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  userDB.findOne({
      uid: req.query.uid,
    },
    function (err, user) {
      console.log("user", user, err)
      if (err) {
        res.status(400).send({
          apiName: "User Check API",
          success: false,
          message: "Some error occurred",
        });
      } else if (!user) {
        admin
          .auth()
          .getUser(req.query.uid)
          .then(function (userRecord) {
            // See the UserRecord reference doc for the contents of userRecord.
            let userInfo = userRecord.toJSON();
            var userData = new userDB({
              uid: req.query.uid,
              name: userInfo.displayName,
              email: userInfo.email,
              mobile: userInfo.phoneNumber,
              profilePicture: userInfo.photoURL || null,
              status: 'active',
              // redeemPoint: req.configure.entryPointForUser || 0
            });
            userData.save(function (err, savedData) {
              console.log(err)
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
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  userDB.findByIdAndUpdate(
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

exports.userProfileStatusUpdate = (req, res) => {
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  userDB.findOneAndUpdate({
      uid: req.query.uid
    }, {
      status: req.body.status
    },
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
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  userDB.findOne({
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

exports.getUserProfileById = (req, res) => {
  if (!req.query.uid) {
    return res.status(400).json({
      apiName: "Get Profile API",
      success: false,
      message: "Please provide user uid.",
    });
  }
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  userDB.findOne({
    uid: req.query.uid
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

exports.usersList = (req, res) => {
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  var search = req.body.search;
  var arr = [];
  if (search) {
    arr.push({
      $match: {
        $or: [{
            name: {
              $regex: search,
              $options: "i"
            }
          }, {
            city: {
              $regex: search,
              $options: "i"
            }
          }, {
            state: {
              $regex: search,
              $options: "i"
            }
          }, {
            country: {
              $regex: search,
              $options: "i"
            }
          },
          {
            pincode: {
              $regex: search,
              $options: "i"
            }
          },
          {
            mobile: {
              $regex: search,
              $options: "i"
            }
          },
        ]
      }
    });
  }

  arr.push({
    $sort: {
      status: 1
    }
  })

  var aggregate = userDB.aggregate(arr);

  var options = {
    page: req.query.page || 1,
    limit: parseInt(req.query.limit) || 200,
  };

  userDB.aggregatePaginate(aggregate, options, function (
    err,
    listdata,
    pageCount,
    count
  ) {
    if (err) {
      res.json({
        apiName: "Users List API",
        success: false,
        message: "Some Error Occured",
      });
    } else {
      res.json({
        apiName: "Users List API",
        success: true,
        message: "Successfully view users list",
        userList: listdata,
        currentPage: req.query.page,
        totalPages: pageCount,
        dataCount: count,
      });
    }
  });
}