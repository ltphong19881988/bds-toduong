// =======================
// get the packages we need ============
// =======================
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');

// var session = require('express-session');
// var csrf = require('csurf');
// var cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');


//var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
global.__basedir = __dirname;


// =======================
// configuration =========
// =======================
var port = process.env.PORT || 2000; // used to create, sign, and verify tokens
// mongoose.Promise = require('bluebird');
mongoose.Promise = global.Promise;
// mongoose.set('useFindAndModify', false);
mongoose.connect(config.database.connectStr, config.database.options); // connect to database

app.set('superSecret', config.secret); // secret variable
app.set('views', (path.join(__dirname, 'views')));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'angular')));
// use body parser so we can get info from POST and/or URL parameters
// app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
// use morgan to log requests to the console
// app.use(morgan('dev'));


// API ROUTES -------------------
//Routes
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });
app.use('/admin', require('./controllers/admin'));
app.use('/', require('./controllers/main'));


// app.use(express.errorHandler());
// app.use(express.logger({
// 		format:'tiny',
// 		stream:fs.createWriteStream('app.log',{'flagd':'w'})
// 	}));
// app.use(function(req,res){
// 		res.status(400);
// 		res.send('File Not Found');
// 	});

// =======================
// start the server ======
// =======================
var server = http.createServer(app);
// app.listen(port, function(e){
//     console.log(e);
// });

// var socketapp = require("./socketapp.js");


server.listen(port, function() {
    console.log('Magic happens at http://localhost:' + port);
    //socketapp.Init(server);
});





// require('./models/investmentpackage').Init(function(a) {})
// require('./models/investmenttime').Init(function(a) {})
// require('./models/group').Init()
// require('./models/initdata').Init()

// const Jimp = require('jimp');
// const fileManager = require('file-manager-js');
// console.log('__basedir', global.__basedir);
// fileManager.list(global.__basedir + '/public/uploads/media').then(async(info) => {
//     // console.log(info);
//     await Promise.all(
// 		info.files.map(async imgPath => {
//             const image = await Jimp.read(imgPath);
//             console.log(image.getBufferAsync('image/bmp'));
//             // console.log(imgPath, image.bitmap.data.toString().length/2048);
//             // var width = image.bitmap.width;
//             // if(width > 1200) width = 1200;
// 			// await image.resize(1200, Jimp.AUTO);
// 			// await image.quality(90);
// 			// await image.writeAsync(imgPath);
// 		})
// 	).then(()=>{
//         console.log('done all images');
//     });

// }).catch((error) => {
//     console.log(error);
//     // res.json({ dirs: [], files: [] });
// });

// MyFunction.senGmailEmail('BazanLand Group', 'tesst', 'ltphong1988@gmail.com', '', 'tesst html');
// // Transaction.deleteMany({ method: /interest/ }).exec();
// Role.Init();


// setTimeout(function() {
//     require('./models/user-sales').createCollection().then(function(collection) {
//         console.log('Collection is created!', collection);
//     });
//     // require('./models/transaction').createCollection().then(function(collection) {
//     //     console.log('Collection is created!', collection);
//     // });
//     // require('./models/transaction').remove({}, function(err, result) {
//     //     console.log(err, result);
//     // });
//     // console.log(mongoose.connections[0].db);
//     // mongoose.connections[0].db.listCollections({ name: 'userinvests' })
//     //     .next(function(err, collinfo) {
//     //         console.log(err, collinfo);
//     //     });
// }, 2000)