const firebase_admin = require("firebase-admin");
const serviceAccount = require("./fire-base.json");

const admin = firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
});

module.exports = {
    admin
}