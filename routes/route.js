//Controller
const authenticationController = require('../controllers/authentication.js');
const contestantsController = require('../controllers/contestants.js');
const taskController = require('../controllers/task.js');
const taskPlayController = require('../controllers/taskPlay.js');
const configurationController = require('../controllers/configuration.js');
const eventController = require('../controllers/events.js');
const usersController = require('../controllers/users.js');
const favoriteController = require('../controllers/favorite.js');
const translationController = require('../controllers/translation.js');
const languageController = require('../controllers/language.js');
const rankingController = require('../controllers/ranking.js');
const notificationController = require('../controllers/pushnotification.js');
const reportController = require('../controllers/report.js');
const dashboardController = require('../controllers/dashboard.js');

//Middlewares
const tokenVerify = require('../middlewares/verifyToken.js');
const showLanguage = require('../middlewares/showLanguagePreference.js');
const favoriteshowLanguage = require('../middlewares/myFavoriteShowLanguage.js');
const contestantFolder = require('../middlewares/createContestantImageFolder.js');
const configuration = require('../middlewares/configurationData.js');
const myFavorite = require('../middlewares/myfavorites.js');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,OPTION")
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
        2. Contestant Individual details
        3. Contestant Create
        4. Contestant Update
        5. Contestant Delete
        6. Contestant Status Update
        7. Contestant favorite api
        8. Contestant Favorite list 
    */
    app.get('/api/v1/contestants', tokenVerify, showLanguage, favoriteshowLanguage, myFavorite, configuration, contestantsController.contestantsList);
    app.get('/api/v1/contestants/info', tokenVerify, showLanguage, favoriteshowLanguage, contestantsController.contestantsDetails);
    app.post('/api/v1/contestants', tokenVerify, showLanguage, contestantFolder, contestantsController.contestantsCreate);
    app.put('/api/v1/contestants', tokenVerify, showLanguage, contestantsController.contestantsImageUpdate);
    app.delete('/api/v1/contestants', tokenVerify, contestantsController.contestantsDelete);
    app.post('/api/v1/contestants/status', tokenVerify, contestantsController.contestantsStatus);
    app.post('/api/v1/contestants/favorite', tokenVerify, configuration, favoriteshowLanguage, favoriteController.saveFavoriteContestants);
    app.get('/api/v1/contestants/favorite/list', tokenVerify, showLanguage, favoriteshowLanguage, favoriteController.getMyFavoriteContestants);

    /*
    Users API.
        1. User Profile Update
        2. View Profile Info
        3. View Profile By Id for admin
        4. Create user information in master DB
        5. Users list
        6. Change status of users
        7. Get users point
    */
    app.put('/api/v1/user/profile', tokenVerify, usersController.userProfileUpdate);
    app.get('/api/v1/user/profile', tokenVerify, usersController.getMyProfile);
    app.get('/api/v1/user/details', tokenVerify, usersController.getUserProfileById);
    app.get('/api/v1/user/create', configuration, usersController.userCheckAndCreate);
    app.get('/api/v1/user/list', tokenVerify, usersController.usersList);
    app.post('/api/v1/user/status', tokenVerify, usersController.userProfileStatusUpdate);
    app.get('/api/v1/user/point', tokenVerify, usersController.availableUserPoints);

    /*
    Event API.
        1. Event List
        2. Language list for selected event
        3. Make event favorite by user
    */
    app.get('/api/v1/event/list', tokenVerify, eventController.getEventList);
    app.get('/api/v1/event/language', tokenVerify, eventController.getEventLanguage);
    app.post('/api/v1/event/favorite', tokenVerify, eventController.saveFavoriteEvent);
    app.post('/api/v1/event/create', tokenVerify, eventController.eventCreate);
    app.put('/api/v1/event/update', tokenVerify, eventController.eventImageUpdate);
    app.get('/api/v1/event/info', tokenVerify, eventController.eventInfo);
    app.get('/api/v1/event/weeks', tokenVerify, eventController.eventWeekList);

    /*
    Task API.
        1. Task Create
        2. Task List
        3. Task Update
        4. Task detail by id api
        5. Add winning contestant in task
    */
    app.post('/api/v1/task', tokenVerify, showLanguage, contestantFolder, taskController.taskCreate);
    app.get('/api/v1/task', tokenVerify, showLanguage, favoriteshowLanguage, taskController.tasksList);
    app.put('/api/v1/task', tokenVerify, showLanguage, favoriteshowLanguage, taskController.taskImageUpdate);
    app.get('/api/v1/task/info', tokenVerify, showLanguage, favoriteshowLanguage, taskController.taskDetails);
    app.post('/api/v1/task/winningcontestant', tokenVerify, taskController.taskWinningContestant);

    /*
    Task Play API.
        1. Task List
    */
    app.post('/api/v1/taskplay', tokenVerify, showLanguage, favoriteshowLanguage, taskPlayController.taskPlayCreate);
    app.get('/api/v1/user/taskplay', tokenVerify, showLanguage, taskPlayController.getUserPalyedTask);

    /*
    Configuration API.
        1. Count of maximum contestant make favorite
    */
    app.get('/api/v1/favoriteContestantMax', tokenVerify, configurationController.getMaxFavoriteContestant);

    /*
    Languages API.
        1. Supported Language list
    */
    app.get('/api/v1/language', tokenVerify, languageController.getLanguageList);
    app.get('/api/v1/language/withoutEnglish', tokenVerify, languageController.getLanguageListWithOutEnglish);

    /*
    Translation
        1. Get all static information 
    */
    app.get('/api/v1/translation', tokenVerify, translationController.getTranslation);

    /*
    Ranking
        1. Get all static information
    */
    app.get('/api/v1/ranking', tokenVerify, rankingController.getRankingList);
    app.get('/api/v1/ranking/banner', tokenVerify, rankingController.getRankingBannerList);
    app.get('/api/v1/ranking/user', tokenVerify, rankingController.getUserCurrentRanking);
    app.get('/api/v1/ranking/all', tokenVerify, rankingController.getOverAllRankingList);
    app.get('/api/v1/ranking/number', tokenVerify, rankingController.getOverAllRanksNumberList);

    /*
    1. User active count
    */
    // app.get('/api/v1/user/active/count', tokenVerify,)

    /*
    1. Notification check
    */
    app.post('/api/v1/deviceToken', tokenVerify, notificationController.saveDeviceTokenForUser);
    app.get('/api/v1/notification', tokenVerify, notificationController.getUserNotification);
    app.post('/api/v1/notification/check', tokenVerify, notificationController.sendPushNotificationToMobile);

    /*
    1. Dashboard
    */
    app.get('/api/v1/event/remainingDate', tokenVerify, eventController.eventStartAndRemainingDay);
    app.get('/api/v1/dashboard/tiles', tokenVerify, dashboardController.dashboardTileCounts);
    app.get('/api/v1/top3/ranking', tokenVerify, rankingController.getTop3RankingList);
    app.get('/api/v1/top10/ranking', tokenVerify, rankingController.getTop10RankingList);

    /*
    1. Report
    */
    app.get('/api/v1/report', tokenVerify, reportController.reportGenerate);
    app.get('/api/v1/user/country', tokenVerify, usersController.listUsersCountry);
    app.get('/api/v1/user/state', tokenVerify, usersController.listUsersState);
    app.get('/api/v1/user/city', tokenVerify, usersController.listUsersCity);
}