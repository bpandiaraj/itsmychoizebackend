const userModel = require("../models/users.js");
const config = require("../config/config.js");
const { getModelByShow } = require("../config/db_connection.js");
const { admin } = require("../shared-datas/fire-base.js");
const logger = require("../config/logger");

exports.userCheckAndCreate = (req, res) => {
  if (!req.query.uid) {
    logger.info("User uid not provide.")
    return res.status(400).send({
      apiName: "User Check API",
      success: false,
      message: "Please provide the user uid.",
    });
  }

  var userDB = getModelByShow(config.masterDB, "user", userModel);
  logger.info("User create api")
  userDB.findOne({
    uid: req.query.uid,
  },
    function (err, user) {
      if (err) {
        logger.info("Error occured while find user")
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
            var uniqueName = userInfo.email.split("@")[0];
            var userData = new userDB({
              uid: req.query.uid,
              name: userInfo.displayName,
              email: userInfo.email,
              mobile: userInfo.phoneNumber,
              profilePicture: userInfo.photoURL || null,
              userName: uniqueName,
              status: 'active',
              point: req.configure.entryPointForUser || 0
            });
            userData.save(function (err, savedData) {
              if (err) {
                logger.info("Error occured while create user")
                res.status(400).send({
                  apiName: "User Check API",
                  success: false,
                  message: "Some error occurred",
                });
              } else {
                logger.info(`User created successfully and point has been added ${req.configure.entryPointForUser}`);
                res.json({
                  apiName: "User Check API",
                  success: true,
                  message: "User profile created successfully.",
                  userProfileUpdated: false
                });
              }
            });
          }).catch(function (error) {
            logger.info("Error occured while create user")
            res.status(400).send({
              apiName: "User Check API",
              success: false,
              message: "Some error occurred",
            });
          });
      } else {
        if (user.status == 'active' || user.status == 'offline') {
          userDB.findOneAndUpdate({
            uid: req.query.uid,
          }, { lastLogin: new Date(), status: "active" }, function (err, userUpdatedData) {
            if (err) {
            } else {
              if (!user.mobile || !user.state || !user.country || !user.pincode) {
                logger.info("User found and profile not updated")
                res.json({
                  apiName: "User Check API",
                  success: true,
                  message: "User found",
                  userProfileUpdated: false
                });
              } else {
                logger.info("User found and profile updated")
                res.json({
                  apiName: "User Check API",
                  success: true,
                  message: "User found",
                  userProfileUpdated: true
                });
              }
            }
          })
        } else {
          res.status(401).json({
            apiName: "User Check API",
            success: false,
            message: "User found and status was inactive.",
          });
        }
      }
    }
  );
};

exports.userProfileUpdate = (req, res) => {
  logger.info("At user update.");
  if (!req.body.mobile && !req.body.state && !req.body.country && !req.body.city && !req.body.pincode) {
    logger.info("Some value missing while update");
    return res.status(400).json({
      apiName: "User Update API",
      success: false,
      message: "Some user information missing.",
    });
  }

  var updateObject = {
    mobile: req.body.mobile,
    gender: req.body.gender || null,
    state: req.body.state,
    country: req.body.country,
    city: req.body.city,
    pincode: req.body.pincode,
    dob: req.body.dob || null,
    modifiedAt: new Date()
  };
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  userDB.findOneAndUpdate({
    uid: req.uid
  }, updateObject,
    function (err, savedData) {
      if (err) {
        logger.info("Error occured profile update.")
        res.status(400).json({
          apiName: "User Update API",
          success: false,
          message: "Error Occurred",
        });
      } else if (!savedData) {
        logger.info("User not found for update profile.")
        res.status(400).json({
          apiName: "User Update API",
          success: false,
          message: "User info not found",
        });
      } else {
        logger.info("User profile updated successfully.")
        res.json({
          apiName: "User Update API",
          success: true,
          message: "User has been updated successfully.",
        });
      }
    });
};

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
          apiName: "User Status Update API",
          success: false,
          message: "Error Occurred",
        });
      } else {
        res.json({
          apiName: "User Status Update API",
          success: true,
          message: `User status has been updated as ${req.body.status}.`,
        });
      }
    });
};

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
  var search = req.query.search;
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
        }]
      }
    });
  }

  if (req.query.status) {
    if (req.query.status != 'all') {
      arr.push({
        $match: {
          status: req.query.status
        },
      });
    }
  } else {
    arr.push({
      $match: {
        status: 'active'
      },
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
};

exports.availableUserPoints = (req, res) => {

  var userDB = getModelByShow(config.masterDB, "user", userModel);
  userDB.findOne({
    _id: req.id
  }, function (err, userInfo) {
    if (err) {
      return res.status(400).json({
        apiName: "Get User Point API",
        success: false,
        message: "Some Error Occured",
      });
    } else if (!userInfo) {
      return res.status(400).json({
        apiName: "Get User Point API",
        success: false,
        message: "User not found",
      });
    } else {
      res.json({
        apiName: "Get User Point API",
        success: true,
        message: "User point founded.",
        point: userInfo.point || 0,
        redeemPoint: userInfo.redeem || 0
      });
    }
  });
};

exports.listUsersCountry = (req, res) => {
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  var search = req.query.search;
  var arr = []
  if (req.query.search) {
    arr.push({
      $match: {
        country: {
          $regex: req.query.search,
          $options: "i"
        }
      }
    });
  }

  var arr1 = [
    {
      $group: {
        _id: "$country"
      }
    },
    {
      $project: {
        _id: 0,
        country: "$_id"
      }
    },
    {
      $sort: {
        country: 1
      }
    }
  ];

  arr = arr.concat(arr1)
  var aggregate = userDB.aggregate(arr);

  var options = {
    page: req.query.page || 1,
    limit: parseInt(req.query.limit) || 50,
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
        countryList: listdata,
        currentPage: req.query.page,
        totalPages: pageCount,
        dataCount: count,
      });
    }
  });
}

exports.listUsersState = (req, res) => {
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  var search = req.query.search;
  var arr = []
  if (req.query.search) {
    arr.push({
      $match: {
        state: {
          $regex: req.query.search,
          $options: "i"
        }
      }
    });
  }

  var arr1 = [
    {
      $group: {
        _id: "$state"
      }
    },
    {
      $project: {
        _id: 0,
        state: "$_id"
      }
    },
    {
      $sort: {
        state: 1
      }
    }
  ];

  arr = arr.concat(arr1)
  var aggregate = userDB.aggregate(arr);

  var options = {
    page: req.query.page || 1,
    limit: parseInt(req.query.limit) || 50,
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
        stateList: listdata,
        currentPage: req.query.page,
        totalPages: pageCount,
        dataCount: count,
      });
    }
  });
}

exports.listUsersCity = (req, res) => {
  var userDB = getModelByShow(config.masterDB, "user", userModel);
  var search = req.query.search;
  var arr = []
  if (req.query.search) {
    arr.push({
      $match: {
        city: {
          $regex: req.query.search,
          $options: "i"
        }
      }
    });
  }

  var arr1 = [
    {
      $group: {
        _id: "$city"
      }
    },
    {
      $project: {
        _id: 0,
        city: "$_id"
      }
    },
    {
      $sort: {
        city: 1
      }
    }
  ];

  arr = arr.concat(arr1)
  var aggregate = userDB.aggregate(arr);

  var options = {
    page: req.query.page || 1,
    limit: parseInt(req.query.limit) || 50,
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
        cityList: listdata,
        currentPage: req.query.page,
        totalPages: pageCount,
        dataCount: count,
      });
    }
  });
}