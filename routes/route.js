const authenticationController = require('../controllers/authentication.js');
const contestantsController = require('../controllers/contestants.js');
const usersController = require('../controllers/users');
const tokenVerify = require('../middlewares/verifyToken');

module.exports = function (app) {

    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Methods", "POST,GET,PUT")
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, x-access-token, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    })

    app.post('/api/v1/admin/login', authenticationController.adminLogin);

    // app.get('/api/v1/landingList', tokenVerify, authenticationController.landingList);

    app.get('/api/v1/contestants', tokenVerify, contestantsController.contestantsList);
    app.post('/api/v1/contestants', tokenVerify, contestantsController.contestantsCreate);
    app.put('/api/v1/contestants', tokenVerify, contestantsController.contestantsUpdate);
    app.delete('/api/v1/contestants', tokenVerify, contestantsController.contestantsDelete);


    //users apis
    app.put('/api/v1/user/profile', tokenVerify, usersController.userProfileUpdate);
    app.get('/api/v1/user/profile', tokenVerify, usersController.getMyProfile);
    app.get('/api/v1/user/create', usersController.userCheckAndCreate);


}