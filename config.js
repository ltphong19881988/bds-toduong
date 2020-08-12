const ip = require("ip").address();

var publicPath = '';
var databaseCF = {
    connectStr: 'mongodb://139.180.185.249:27017/bds-toduong',
    options: {
        keepAlive: true,
        reconnectTries: Number.MAX_VALUE,
        // useMongoClient: true,
        useCreateIndex: true,
        useNewUrlParser: true,
        // useFindAndModify: false,
        // useUnifiedTopology: true,
        replicaSet: 'rs0',
    }

}
if (ip == '139.180.185.249') {
    console.log(' o server');
    databaseCF = {
        connectStr: 'mongodb://139.180.185.249:27017/bds-toduong',
        options: {
            keepAlive: true,
            reconnectTries: Number.MAX_VALUE,
            // useMongoClient: true,
            useCreateIndex: true,
            useNewUrlParser: true,
            // useUnifiedTopology: true,
            replicaSet: 'rs0',
            user: 'toduong',
            pass: 'toduong!@#@123'
        }
    }
    publicPath = '/root/home/demo/';
}


module.exports = {
    fcmKey: 'AAAAyNKgGwg:APA91bGDhrIXPvI7chnyynRg5aKmDtDFT6xYhZF5l1ierwW-MPtdkullvdOotpa3byGlzHVxY6gRa_ZQsZ92BzH6OJICU3astb5LDtNUvjQIsyehmfzPsGTFgoajjtqzO837nwWwErad',
    'serverSeed': '1199932bf7dbcea2030fa899f6f591bd09511a49857a67134ab384d7c6fba4a5',
    'clientSeed': '000000000000000007a9a31ff7f07463d91af6b5454241d5faf282e5e0fe1b3a',
    'secret': 'alluneedev',
    'database': databaseCF,
    'publicPath': publicPath,
    'allowIP': '127.0.0.1',
    'reCaptchaKey': '6LeQNjsUAAAAAODIAq8fxuXiLHwtLuAoIuy2LnfT',
    'reCaptchaKSecrect': '6LeQNjsUAAAAAMQMspip8e39YQEcC8jKxIOq6Vhp',
    'reCaptchaKeyLocal': '6LfXNjsUAAAAAOPfroYZRzkZTlhKhjTxMQWC3ykd',
    'reCaptchaKSecrectLocal': '6LfXNjsUAAAAABRRFz1eZ5Ujx85voFdBFom6bo8E',
    directions: [
        { code: 'TB', title: "Tây Bắc", title2: "hướng Tây Bắc", priority: 0 },
        { code: 'B', title: "Bắc", title2: "hướng Bắc", priority: 1 },
        { code: 'DB', title: "Đông Bắc", title2: "hướng Đông Bắc", priority: 2 },
        { code: 'D', title: "Đông", title2: "hướng Đông", priority: 3 },
        { code: 'DN', title: "Đông Nam", title2: "hướng Đông Nam", priority: 4 },
        { code: 'N', title: "Nam", title2: "hướng Nam", priority: 5 },
        { code: 'TN', title: "Tây Nam", title2: "hướng Tây Nam", priority: 6 },
        { code: 'T', title: "Tây", title2: "hướng Tây", priority: 7 },
    ]

};