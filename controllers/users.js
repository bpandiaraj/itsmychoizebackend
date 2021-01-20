const admin = require("../shared-datas/fire-base.js");

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
                status: !userInfo.disabled,
                role: "user",
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
                    message: "User found",
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
