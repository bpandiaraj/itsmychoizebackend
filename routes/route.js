const authenticationController = require('../controllers/authentication.js');
const contestantsController = require('../controllers/contestants.js');
const configurationController = require('../controllers/configuration.js');
const eventController = require('../controllers/events.js');
const usersController = require('../controllers/users.js');
const favoriteController = require('../controllers/favorite.js');

//Middlewares
const tokenVerify = require('../middlewares/verifyToken');
const showLanguage = require('../middlewares/showLanguagePreference');
const favoriteshowLanguage = require('../middlewares/myFavoriteShowLanguage');
const contestantFolder = require('../middlewares/createContestantImageFolder');

module.exports = function (app) {

    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Methods", "POST,GET,PUT")
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, x-access-token, X-Requested-With, Content-Type, Accept, app, show, uid");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    })

    /*
    Admin API.
        1. Admin Login
    */
    app.post('/api/v1/admin/login', authenticationController.adminLogin);

    /*
    Contestants API.
        1. Contestant List
        2. Contestant Individual detail
        3. Contestant Create
        4. Contestant Update
        5. Contestant Delete
        6. Contestant Status Update
        7. 
    */
    app.get('/api/v1/contestants', tokenVerify, showLanguage, favoriteshowLanguage, contestantsController.contestantsList);
    app.get('/api/v1/contestants/info', tokenVerify,showLanguage, favoriteshowLanguage, contestantsController.contestantsDetails);
    app.post('/api/v1/contestants', tokenVerify, showLanguage, contestantFolder, contestantsController.contestantsCreate);
    app.put('/api/v1/contestants', tokenVerify, showLanguage, contestantsController.contestantsImageUpdate);
    app.delete('/api/v1/contestants', tokenVerify, contestantsController.contestantsDelete);
    app.post('/api/v1/contestants/status', tokenVerify, contestantsController.contestantsStatus);
    app.post('/api/v1/contestants/favorite', tokenVerify, favoriteController.saveFavoriteContestants);
    app.get('/api/v1/contestants/favorite/list', tokenVerify, favoriteController.getMyFavoriteContestants);

    /*
    Users API.
        1. User Profile Update
        2. View Profile Info
        3. Create user information in master DB
    */
    app.put('/api/v1/user/profile', tokenVerify, usersController.userProfileUpdate);
    app.get('/api/v1/user/profile', tokenVerify, usersController.getMyProfile);
    app.get('/api/v1/user/details', tokenVerify, usersController.getUserProfileById);
    app.get('/api/v1/user/create', usersController.userCheckAndCreate);
    app.get('/api/v1/user/list', tokenVerify, usersController.usersList);
    app.post('/api/v1/user/status', tokenVerify, usersController.userProfileStatusUpdate);
    app.post('/api/v1/user/point', tokenVerify, usersController.availableUserPoints);

    /*
    Event API.
        1. Event List
        2. Language list for selected event
        3. Make event favorite by user
    */
    app.get('/api/v1/event/list', tokenVerify, eventController.getEventList);
    app.get('/api/v1/event/language', tokenVerify, eventController.getEventLanguage);
    app.post('/api/v1/event/favorite', tokenVerify, eventController.saveFavoriteEvent);

    /*
    Configuration API.
        1. Count of maximum contestant make favorite
    */
    app.get('/api/v1/favoriteContestantMax', tokenVerify, configurationController.getMaxFavoriteContestant);
}