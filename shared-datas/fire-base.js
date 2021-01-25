const admin = require('firebase-admin');
const serviceAccount = require("./fire-base.json");

const firebase_admin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = {
    firebase_admin
}