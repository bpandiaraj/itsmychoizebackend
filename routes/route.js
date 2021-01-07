module.exports = function (app) {

    let verifyToken = require('../middlewares/verifyToken');

    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Methods", "POST,GET,PUT")
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, x-access-token, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    })

    app.post('/api/', )
    app.get('/api/', verifyToken, )
    app.put('/api/', verifyToken, )
    
}