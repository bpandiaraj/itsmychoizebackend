var FCM = require('fcm-node');
const { admin } = require("../shared-datas/fire-base.js");

exports.sendPushNotification = async function (token, title, body) {
    console.log("messageID", token, title, body);
    
    var fcm = new FCM('AAAAz5ZkRfs:APA91bG2_xTjLExYwXolxSKU4pvFsHNYmSfnCPWqe-wh004JOtWE9a6X5PYbYRwgxw9EpgZLFsQ3UHoK-z54lIMK3Gwwb8J0T7XLkwRoeaZg7EAS0PhYaxsqFm0VarJaFASefuN7kIZQ');

    if (token) {
        token.forEach(element => {
            var message = {
                to: element,
                collapse_key: 'com.its_my_choize',

                notification: {
                    title: title, // Event Name ex : Bigg Boss Tamil
                    body: body  // task notification
                },
                data: {
                    app: "Its My Choize"
                }
            };

            fcm.send(message, function (err, response) {
                if (err) console.error(err);
                else console.log(response);
            });
        });
    }
}
