var gcm = require('node-gcm');

exports.sendPushNotification = function () {
    var message = new gcm.Message({
        collapseKey: 'demo',
        priority: 'high',
        contentAvailable: true,
        delayWhileIdle: true,
        timeToLive: 3,
        restrictedPackageName: "somePackageName",
        dryRun: true,
        data: {
            key1: 'message1',
            key2: 'message2'
        },
        notification: {
            title: "Hello, World",
            icon: "ic_launcher",
            body: "This is a notification that will be displayed if your app is in the background."
        }
    });
}