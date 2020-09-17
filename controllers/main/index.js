const express = require('express');
const mongoose = require('mongoose');
const passwordHasher = require('aspnet-identity-pw');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
// var async = require('async');
var router = express.Router();
var User = require('../../models/user');
const ListProvince = require('../../models/listprovince');
const Category = require('../../models/category');
const Post = require('../../models/post');
const PostContent = require('../../models/post-content');
const Project = require('../../models/project');
const Product = require('../../models/product');
const OneLvlUrl = require('../../models/onelvlurl');
const AppConfig = require('../../models/app-config');
const mw = require('../../models/helpers/my-middleware');
var MyFunction = require('../../models/helpers/my-function');

var config = require('../../config'); // get our config file
const { resolve } = require('path');
const ProductContent = require('../../models/product-content');
var secretKey = config.secret;

var getSEO_Info = async function(url, req, res, next) {
    if (req.originalUrl.startsWith('/admin') == true) {
        return next();
    }
    // console.log('start url', url);
    if (url == null) url = req.originalUrl.replace('/', '');
    else url = url.replace('/', '');
    if (url.indexOf('-pr') != -1 || url.indexOf('-pj') != -1 || url.indexOf('-nr') != -1) {
        if (req.originalUrl.indexOf('-pr') != -1) {
            var abc = req.originalUrl.split('-pr');
            var product = await Product.findOne({ nameKey: 'pr' + abc[abc.length - 1] });
            var productContent = await ProductContent.findOne({ idProduct: product._id });
            return productContent;
        }
        return null;
    }
    if (url.indexOf('news') != -1)
        url = url.replace('news/', '');
    var abc = url.split('/');
    if (abc[0] == '') abc[0] = '/';
    // console.log('find url', abc);
    var onelvlData = await OneLvlUrl.findOne({ oneLvlUrl: abc[0] });
    if (!onelvlData) return null;
    return onelvlData;
}

router.use(async function(req, res, next) {
    if (req.originalUrl.indexOf('_escaped_fragment_') == -1) {

        return next();
    } else {
        var fragment = req.query._escaped_fragment_;
        // console.log('bat dau kiem tra');
        // If the fragment is empty, serve the
        // index page
        if (fragment === "" || fragment === "/")
            fragment = "/";
        // If fragment does not start with '/'
        // prepend it to our fragment
        if (fragment.charAt(0) !== "/")
            fragment = '/' + fragment;
        try {
            // console.log(global.__basedir, 'di vo day roi');
            var file = global.__basedir + "/snapshots" + req.originalUrl.split('?_escaped_fragment')[0] + fragment + '/index.html';
            res.sendFile(file);
        } catch (err) { res.send(404); }
    }

})

router.use('/product', require('./product'));
router.use('/sector', require('./sector'));
router.use('/post', require('./post'));
router.use('/project', require('./project'));
router.use('/user', require('./user'));



router.use('/uploads/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.get('/robot.txt', function(req, res) {
    var file = global.__basedir + '/robot-toduong.txt';
    if (req.headers.host.indexOf('batdongsantotnhat.vn') != -1)
        file = global.__basedir + '/robot-totnhat.txt';
    res.sendFile(file);
})

router.get('/sitemap.xml', function(req, res) {
    var file = global.__basedir + '/sitemap-toduong.xml';
    if (req.headers.host.indexOf('batdongsantotnhat.vn') != -1)
        file = global.__basedir + '/sitemap-totnhat.xml';
    res.sendFile(file);
})


function abc() {
    const https = require('https');
    return new Promise((resolve, reject) => {
        https.get('https://restcountries.eu/rest/v2/all', (resp) => {
            let data = '';
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                var listItems = JSON.parse(data);
                resolve(listItems);

            });
        }).on("error", (err) => {
            reject("error");
        });
    });

}

// router.get('/import-country', async(req, res) => {
//     // var k = await abc();
//     // var Country = require('../models/country');
//     // Country.insertMany(k, function(err, result) {
//     //     res.json(result);
//     // })
// })

router.post('/init-web', async(req, res, next) => {
    // console.log(req.body);
    var menuDistrict = req.body.menuDistrict;
    var options = {};
    var siteConfig = new Promise(resolve => {
        AppConfig.aggregate([
            { $match: options },
            { $sort: { datecreate: -1 } }
        ]).exec(function(err, result) {
            resolve(result);
        });
    });

    options = {};
    if (menuDistrict.type) {
        options['type'] = menuDistrict.type.toString();
    }
    if (menuDistrict.provinceID) {
        options['provinceID'] = parseInt(menuDistrict.provinceID);
    }
    if (menuDistrict.districtID) {
        options['districtID'] = parseInt(menuDistrict.districtID);
    }
    if (menuDistrict.list) {
        options['ID'] = { $in: menuDistrict.list };
    }
    var listDistrict = new Promise(resolve => {
        ListProvince.aggregate([
            { $match: options },
            {
                $project: {
                    // _id: 1,
                    ID: 1,
                    // stt: 1,
                    title: 1,
                    // code: 1,
                    type: 1,
                    link: 1,
                    provinceID: { $ifNull: ["$provinceID", -1] },
                    provinceTitle: { $ifNull: ["$provinceTitle", ""] },
                    provinceTitleLink: { $ifNull: ["$provinceTitleLink", ""] },
                    districtID: { $ifNull: ["$districtID", -1] },
                    districtTitle: { $ifNull: ["$districtTitle", ""] },
                    districtTitleLink: { $ifNull: ["$districtTitleLink", ""] },
                    priority: 1,
                }
            },
            { $sort: { type: 1, priority: 1, ID: 1 } }
        ]).exec(function(err, result) {
            resolve(result);
        });
    });

    var listNews = new Promise(resolve => {
        Category.aggregate([{
                $match: { idCategoryType: mongoose.Types.ObjectId('5f166a011ab04a0e50f990b5') },
            },
            {
                $sort: { idParent: 1, priority: 1 }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "idCategory",
                    as: "catePost"
                },
            },
            { $unwind: "$catePost" },
            {
                $match: { 'catePost.postType': 0 },
            },
            {
                $lookup: {
                    from: "postcontents",
                    localField: "catePost._id",
                    foreignField: "idPost",
                    as: "catePostContent"
                },
            },
            { $unwind: "$catePostContent" },
            // {
            //     $project: {
            //         "categoryType": 1,
            //         "_id": 1,
            //         "name": 1,
            //         "priority": 1,
            //         "idParent": 1,
            //         "datecreate": 1,
            //     }
            // },

        ], function(err, result) {
            // console.log('cate', result);
            resolve(result);
        })
    })

    // var listPhongThuy = new Promise(resolve => {
    //     Category.aggregate([{
    //             $match: { idCategoryType: mongoose.Types.ObjectId('5f3f4c1183c2f72c8c4e600e') },
    //         },
    //         {
    //             $sort: { idParent: 1, priority: 1 }
    //         },
    //         {
    //             $lookup: {
    //                 from: "posts",
    //                 localField: "_id",
    //                 foreignField: "idCategory",
    //                 as: "catePost"
    //             },
    //         },
    //         { $unwind: "$catePost" },
    //         {
    //             $match: { 'catePost.postType': 0 },
    //         },
    //         {
    //             $lookup: {
    //                 from: "postcontents",
    //                 localField: "catePost._id",
    //                 foreignField: "idPost",
    //                 as: "catePostContent"
    //             },
    //         },
    //         { $unwind: "$catePostContent" },

    //     ], function(err, result) {
    //         // console.log('cate', result);
    //         resolve(result);
    //     })
    // })

    Promise.all([siteConfig, listDistrict, listNews]).then(values => {
        res.json({ siteConfig: values[0], menuDistrict: values[1], listNews: values[2]});
    })

})

router.post('/site-config', async(req, res, next) => {
    console.log(req.body);
    var options = {};
    AppConfig.aggregate([
        { $match: options },
        { $sort: { datecreate: -1 } }
    ]).exec(function(err, result) {
        res.json(result);
    });
})

router.post('/data-index', async(req, res, next) => {
    var optionsSlider = { postType: 2 };
    if (req.body.webname) {
        optionsSlider['videoTitle'] = req.body.webname;
    }
    var listSliders = new Promise(resolve => {
        Post.aggregate([
            { $match: optionsSlider },
            { $sort: { datecreate: -1 } }
        ]).exec(function(err, result) {
            resolve(result);
        });
    });

    var optionsProject = {};

    var listHotProjects = new Promise(resolve => {
        Project.aggregate([
            { $match: optionsProject },
            {
                $lookup: {
                    from: "projectcontents",
                    localField: "_id",
                    foreignField: "idProject",
                    as: "projectContent"
                }
            },
            { $unwind: "$projectContent" },
            { $sort: { datecreate: -1 } },
            { $skip: 0 },
            { $limit: 3 },
        ]).exec(function(err, result) {
            resolve(result);
        });
    });

    var optionsProduct = { visible: 1 };
    var newProducts = new Promise(resolve => {
        Product.aggregate([{
                $match: optionsProduct,
            },
            {
                $sort: { datecreate: -1 }
            },
            {
                $lookup: {
                    from: "productcontents",
                    localField: "_id",
                    foreignField: "idProduct",
                    as: "productContent"
                },
            },
            { $unwind: "$productContent" },
            { "$skip": 0 },
            { "$limit": 6 },

        ], function(err, result) {
            resolve(result);
        });
    });

    Promise.all([listSliders, listHotProjects, newProducts]).then(values => {
        res.json({ listSliders: values[0], listHotProjects: values[1], newProducts: values[2] });
    })

})

router.post('/one-content', async(req, res, next) => {
    console.log(req.body);
    var abc = await PostContent.findOne({ oneLvlUrl: req.body.url }).exec();
    if (!abc) return res.json({ status: false, mes: "Không tìm thấy bài viết" });
    res.json({ status: true, oneContent: abc });
})

router.post('/seo-info', async(req, res, next) => {
    // console.log('post url', req.body.url);
    var onelvlData = await getSEO_Info(req.body.url, req, res, next);
    // console.log('getSEO_Info', onelvlData);
    if (!onelvlData)
        return res.json({ status: false, seoInfo: {} });
    else
        return res.json({ status: true, seoInfo: onelvlData });
})


router.get('/verify-email-link/:email', async(req, res, next) => {
    var abc = await User.findOne({ email: req.params.email }).exec();

    res.json('/confirm-email/' + abc.password);
})

router.post('/resend-verify-email/', async(req, res, next) => {
    var abc = await User.findOne({ email: req.body.email });
    if (!abc.verifyEmailCode) {
        abc['verifyEmailCode'] = await MyFunction.RandomString(20);
        // Must be await update unless data will not be change
        await User.findOneAndUpdate({ _id: abc._id }, { verifyEmailCode: abc['verifyEmailCode'] });
    }
    var info = await MyFunction.sendVerifyEmail(abc);
    console.log(info);
    res.json(info);
})

router.get('/confirm-email/:code', async(req, res, next) => {
    // console.log(req.params.code);
    var abc = await User.findOne({ verifyEmailCode: req.params.code }).exec();
    if (abc == null) return res.json('failed');
    await User.findOneAndUpdate({ _id: abc._id }, { verifyEmail: true }).exec();
    res.redirect('/login');
})

var registerMW = [mw.ValidateRegister]
router.post('/register', registerMW, async(req, res, next) => {
    // console.log(req.body); dsf
    var ranStr = await MyFunction.RandomString(20);
    var memberGroup = await Group.findOne({ name: 'member' });
    var max = await User.findOne({
        'groups': {
            '$elemMatch': {
                '$eq': memberGroup._id
            }
        }
    }).sort({ code: -1 });
    var item = {
        username: req.body.username.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: passwordHasher.hashPassword(req.body.password),
        groups: [memberGroup._id],
        roles: [],
        secret2fa: {},
        facebook: {},
        verifyEmailCode: ranStr,
        code: max.code + 1,
    }

    var checkRefId = await User.findOne({
        code: req.body.refId,
        'groups': {
            '$elemMatch': {
                '$eq': memberGroup._id
            }
        }
    }).exec();

    console.log('checkRefId', checkRefId);
    if (!checkRefId) {
        item.sponsor = '';
        item.idSponsor = null;
        item.sponsorLevel = 0;
        item.sponsorAddress = '';
        item.parentCode = null;
    } else {
        item.sponsor = checkRefId.username;
        item.idSponsor = checkRefId._id;
        item.sponsorLevel = checkRefId.sponsorLevel + 1;
        item.sponsorAddress = checkRefId.sponsorAddress + '-';
        item.parentCode = checkRefId.code;
    }
    // console.log(item.sponsorAddress);
    var countDownLine = await User.countDocuments({ idSponsor: item.idSponsor }).exec();
    item.sponsorAddress += countDownLine;
    // console.log(item.sponsorAddress);
    // console.log('countDownLine', countDownLine, item.sponsorAddress + countDownLine);

    User.addUser(item, async function(result) {
        if (result.status) {
            // var send = await MyFunction.sendVerifyEmail(item);
            // console.log(send);
            res.json(result);
        } else {
            res.json(result);
        }

    })

})


var loginMW = [mw.ValidateLogin]
router.post('/login', loginMW, async(req, res, next) => {
    console.log(passwordHasher.hashPassword('admintoduong@!@#'));
    var e = await User.findOne({ email: req.body.login.toLowerCase() }).exec();
    var u = await User.findOne({ username: req.body.login.toLowerCase() }).exec();
    if (!e && !u) {
        return res.json({ status: false, mes: "Email hoặc username không tồn tại" });
    }
    var getId;
    if (!e) getId = u;
    else getId = e;
    if (!passwordHasher.validatePassword(req.body.password, getId.password)) {
        return res.json({ status: false, mes: 'Password not correct sai mật khẩu' });
    } else {
        var abc = {
            _id: getId._id,
            // info: getId.info,
            code: getId.code,
            parentCode: getId.parentCode,
            email: getId.email,
            username: getId.username,
            // fullname: getId.fullname,
            lock: getId.lock,
            verifyEmail: getId.verifyEmail,
            verifyPhone: getId.verifyPhone,
            // bankInfo: getId.bankInfo,
            sponsor: getId.sponsor,
            idSponsor: getId.idSponsor,
            sponsorAddress: getId.sponsorAddress,
            sponsorLevel: getId.sponsorAddress,
        }
        var token = jwt.sign(abc, secretKey, {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
        });
        res.cookie('x-access-token', token, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24) });
        res.json({ status: true, mes: 'login success', token: token });
    }
    // res.json(getId);;

})

router.get('/*', async function(req, res, next) {
    if (req.originalUrl.indexOf('.js') == -1 && req.originalUrl.indexOf('.map') && req.originalUrl.indexOf('.ico') == -1) {
        console.log('vao lay SEOINFO', req.originalUrl);
        req.seoInfo = await getSEO_Info(null, req, res, next);
    }

    if (!req['seoInfo']) req['seoInfo'] = {};
    if (!req.seoInfo['title']) req.seoInfo['title'] = '';
    if (!req.seoInfo['seoKeyWord']) req.seoInfo['seoKeyWord'] = '';
    if (!req.seoInfo['seoDescriptions']) req.seoInfo['seoDescriptions'] = '';
    // res.redirect('/lending');
    res.render('layout/frontPage', { seoInfo: req.seoInfo });
})



module.exports = router