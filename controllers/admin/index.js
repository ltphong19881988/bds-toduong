var express = require('express');
var async = require('async');
var request = require('request');
var moment = require('moment');
const mongoose = require('mongoose');
var passwordHasher = require('aspnet-identity-pw');
var jwt = require('jsonwebtoken');
var router = express.Router();
const User = require('../../models/user');
const Group = require('../../models/group');
const AppConfig = require('../../models/app-config');
const Post = require('../../models/post');
// var UserRole   = require('../models/userrole');
// var UserAuth   = require('../models/userauth');

var config = require('../../config'); // get our config file
// var Helpers = require('../helpers');
var secretKey = config.secret;

var getCookies = function(cookie, cname) {
    if (!cookie) {
        return "";
    }
    var name = cname + "=";
    var ca = cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Helpers.writeLog("abc", {username : 'phongle', status : true}, function(result){});

router.use(function(req, res, next) {
    // console.log(req);
    var token = req.body.token || req.query.token || getCookies(req.headers.cookie, "x-access-token");
    next();
    // decode token
    // if (token) {
    //     // verifies secret and checks exp
    //     jwt.verify(token, secretKey, async function(err, decoded) {
    //         if (err) {
    //             return res.json({ success: false, message: 'Failed to authenticate token.' });
    //         } else {
    //             // if everything is good, save to request for use in other routes
    //             var user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded._id) });
    //             var admin = await Group.findOne({ name: 'admin' });
    //             if (user.groups.indexOf(admin._id) == -1) {
    //                 return res.json({ success: false, message: 'Failed to authenticate your account permission.' });
    //             } else {
    //                 // console.log(user);
    //                 req.decoded = decoded;
    //                 next();
    //             }

    //         }
    //     });

    // } else {
    //     res.redirect("/login?redirect=" + req.originalUrl);
    // }
})

router.use('/media', require('./media'));
router.use('/category', require('./category'));
router.use('/sector', require('./sector'));
router.use('/product-type', require('./product-type'));
router.use('/product', require('./product'));
// router.use('/xcode', require('./xcode'));
// router.use('/member', require('./member'));
// router.use('/transactions', require('./transactions'));
// router.use('/promotion', require('./promotion'));
// router.use('/order', require('./order'));
// router.use('/video', require('./video'));
// router.use('/notification', require('./notification'));



router.get('/', function(req, res, next) {
    res.redirect('/admin/index');
})

router.get('/init', function(req, res, next) {
    // var CT = require('../../models/category-type');
    // CT.Init();
})

router.get('/add-city', function(req, res, next) {
    request.get({
        // headers: {
        //     'content-type' : 'application/json',
        //     'Authorization' : 'key='+config.fcmKey ,
        // },
        url: 'https://thongtindoanhnghiep.co/api/city',
        // body:   abc,
        json: true
    }, function(error, response, body) {
        console.log({ error, response, body });
        var listItem = body.LtsItem.map(function(val, index) {
            return {
                ID: val.ID,
                stt: val.STT,
                title: val.Title,
                type: val.Type,
                link: val.SolrID.replace('/', ''),
            };
        })
        var listProvince = require('../../models/listprovince');
        listProvince.insertMany(listItem, function(err, result) {
            res.json(result);
        })
    });
})

router.get('/add-quan', function(req, res, next) {
    request.get({
        // headers: {
        //     'content-type' : 'application/json',
        //     'Authorization' : 'key='+config.fcmKey ,
        // },
        url: 'https://thongtindoanhnghiep.co/api/city/4/district',
        // body:   abc,
        json: true
    }, function(error, response, body) {
        console.log({ error, response, body });
        var listItem = body.map(function(val, index) {
            var abc = val.SolrID.split('/');
            return {
                ID: val.ID,
                stt: val.STT,
                title: val.Title,
                type: val.Type,
                link: abc[2] + '-' + abc[1],
                provinceID: val.TinhThanhID,
                provinceTitle: val.TinhThanhTitle,
                provinceTitleLink: val.TinhThanhTitleAscii.replace('/', ''),
            };
        })
        var listProvince = require('../../models/listprovince');
        listProvince.insertMany(listItem, function(err, result) {
            res.json(result);
        })
    });
})

router.get('/add-phuong', function(req, res, next) {
    var listProvince = require('../../models/listprovince');
    listProvince.find({ type: 2 }, function(err, results) {
        // console.log(err, results);
        // res.json(results);
        var promises = results.map(function(element) {
            console.log('dau', element.ID);
            return new Promise(function(resolve, reject) {
                request.get({
                    url: 'https://thongtindoanhnghiep.co/api/district/' + element.ID + '/ward',
                    json: true
                }, function(error, response, body) {
                    var listItem = body.map(function(val, index) {
                        var abc = val.SolrID.split('/');
                        return {
                            ID: val.ID,
                            stt: val.STT,
                            title: val.Title,
                            type: val.Type,
                            link: abc[abc.length - 1] + '-' + element.link,
                            provinceID: val.TinhThanhID,
                            provinceTitle: val.TinhThanhTitle,
                            provinceTitleLink: element.provinceTitleLink,
                            districtID: val.QuanHuyenID,
                            districtTitle: val.QuanHuyenTitle,
                            districtTitleLink: element.link,
                        };
                    })
                    listProvince.insertMany(listItem, function(err, result) {
                        console.log('cuoi', element.ID);
                        resolve(element.ID);
                    })
                });

            })
        });

        Promise.all(promises).then((data) => {
            res.json(data);
        });

    })

})


router.post('/site-config', async(req, res, next) => {
    if (!req.body.key || !req.body.value) return res.json({ status: false, mes: 'Vui lòng nhập đầy đủ' });
    var item = new AppConfig({
        key: req.body.key,
        type: req.body.type,
    })
    if (req.body.type == 'number') {
        item.value = parseInt(req.body.value);
    } else if (req.body.type == 'object') {
        item.value = JSON.parse(req.body.value);
        item.value = JSON.parse(item.value);
        console.log(typeof item.value);
    } else {
        item.value = req.body.value;
    }
    item.save(function(err, doc) {
        if (err) return res.json({ status: false, mes: 'Lỗi không lưu được, vui lòng thử lại sau', err: err });
        return res.json({ status: true, mes: 'Thành công', doc })
    });

})

router.put('/site-config', async(req, res, next) => {
    console.log(req.body);
    if (!req.body.key || !req.body.value) return res.json({ status: false, mes: 'Vui lòng nhập đầy đủ' });
    var item = {
        key: req.body.key,
        type: req.body.type,
    }
    if (req.body.type == 'number') {
        item.value = parseInt(req.body.value);
    } else if (req.body.type == 'object') {
        item.value = JSON.parse(req.body.value);
        console.log(typeof item.value);
    } else {
        item.value = req.body.value;
    }
    var doc = await AppConfig.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, item, { new: true });
    res.json({ status: true, mes: 'Thành công', doc });
})

router.post('/all-site-config', async(req, res, next) => {
    console.log(req.body);
    AppConfig.aggregate([
        // { $match: options },
        { $sort: { datecreate: -1 } }
    ]).exec(function(err, result) {
        // console.log(err, result);
        if (err) result = [];
        var records = {
            'draw': req.body.aoData[0].value,
            'recordsTotal': 2,
            'recordsFiltered': 0,
            'data': result
        };
        res.json(records);
    });

})

router.post('/slider', async(req, res, next) => {
    if (!req.body.videoUrl) return res.json({ status: false, mes: 'Bạn chưa chọn hình ảnh' });
    var item = new Post(req.body);
    item.save(function(err, doc) {
        if (err) return res.json({ status: false, mes: 'Lỗi không lưu được, vui lòng thử lại sau', err: err });
        return res.json({ status: true, mes: 'Thành công', doc })
    });
})

router.put('/slider', async(req, res, next) => {
    if (!req.body.videoUrl) return res.json({ status: false, mes: 'Bạn chưa chọn hình ảnh' });
    var id = mongoose.Types.ObjectId(req.body._id);
    delete req.body._id;
    Post.findOneAndUpdate({ _id: id }, req.body).exec(function(err, post) {
        return res.json({ status: true, mes: 'Thành công', post })
    })
})

router.put('/delete', async(req, res, next) => {
    if (!req.body._id) return res.json({ status: false, mes: 'Xóa thất bại' });
    var id = mongoose.Types.ObjectId(req.body._id);
    Post.findOneAndUpdate({ _id: id }, req.body).exec(function(err, post) {
        return res.json({ status: true, mes: 'Thành công', post })
    })
})

router.post('/slider/all', async(req, res, next) => {
    Post.find({ postType: 2 }, function(err, posts) {
        res.json(posts);
    });

})

router.get('/lock', function(req, res, next) {
    var username = req.query.username;
    var value = req.query.value;
    User.update({ username: username }, { $set: { lock: value } }, { upsert: true }, function(err, result) {
        console.log(err, result);
        res.json(result);
    })
})



router.get('/*', function(req, res, next) {
    res.render("layout/admin");
})

// GetTotalDeposit(true, function(result){
//     console.log(result);
// })


module.exports = router