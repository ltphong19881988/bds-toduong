var express = require('express');
const { exec } = require("child_process");
const path = require('path');
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
const OneLvlUrl = require('../../models/onelvlurl');
// var UserAuth   = require('../models/userauth');
const fs = require('fs');
const Tool = require('../../models/helpers/tool');


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
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, secretKey, async function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                var user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded._id) });
                var admin = await Group.findOne({ name: 'admin' });
                if (user.groups.indexOf(admin._id) == -1) {
                    return res.json({ success: false, message: 'Failed to authenticate your account permission.' });
                } else {
                    // console.log(user);
                    req.decoded = decoded;
                    next();
                }

            }
        });

    } else {
        res.redirect("/login?redirect=" + req.originalUrl);
    }
})

router.use('/media', require('./media'));
router.use('/category', require('./category'));
router.use('/sector', require('./sector'));
router.use('/product-type', require('./product-type'));
router.use('/product', require('./product'));
router.use('/post', require('./post'));
router.use('/project', require('./project'));

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

// router.get('/add-quan', function(req, res, next) {
//     request.get({
//         // headers: {
//         //     'content-type' : 'application/json',
//         //     'Authorization' : 'key='+config.fcmKey ,
//         // },
//         url: 'https://thongtindoanhnghiep.co/api/city/23/district',
//         // body:   abc,
//         json: true
//     }, function(error, response, body) {
//         console.log({ error, response, body });
//         // res.json('fea');
//         var listItem = body.map(function(val, index) {
//             var abc = val.SolrID.split('/');
//             return {
//                 ID: val.ID,
//                 stt: val.STT,
//                 title: val.Title,
//                 type: val.Type,
//                 link: abc[2] + '-' + abc[1],
//                 provinceID: val.TinhThanhID,
//                 provinceTitle: val.TinhThanhTitle,
//                 provinceTitleLink: val.TinhThanhTitleAscii.replace('/', ''),
//             };
//         })
//         var listProvince = require('../../models/listprovince');
//         listProvince.insertMany(listItem, function(err, result) {
//             res.json(result);
//         })
//     });
// })

// router.get('/add-phuong', function(req, res, next) {
//     var listProvince = require('../../models/listprovince');
//     listProvince.find({ type: 2, provinceID: 23 }, function(err, results) {
//         // console.log(err, results);
//         // res.json(results);
//         var promises = results.map(function(element) {
//             console.log('dau', element.ID);
//             return new Promise(function(resolve, reject) {
//                 request.get({
//                     url: 'https://thongtindoanhnghiep.co/api/district/' + element.ID + '/ward',
//                     json: true
//                 }, function(error, response, body) {
//                     var listItem = body.map(function(val, index) {
//                         var abc = val.SolrID.split('/');
//                         return {
//                             ID: val.ID,
//                             stt: val.STT,
//                             title: val.Title,
//                             type: val.Type,
//                             link: abc[abc.length - 1] + '-' + element.link,
//                             provinceID: val.TinhThanhID,
//                             provinceTitle: val.TinhThanhTitle,
//                             provinceTitleLink: element.provinceTitleLink,
//                             districtID: val.QuanHuyenID,
//                             districtTitle: val.QuanHuyenTitle,
//                             districtTitleLink: element.link,
//                         };
//                     })
//                     listProvince.insertMany(listItem, function(err, result) {
//                         console.log('cuoi', element.ID);
//                         resolve(element.ID);
//                     })
//                 });

//             })
//         });

//         Promise.all(promises).then((data) => {
//             res.json(data);
//         });

//     })
// })


// ======= all site config request 
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
        { $sort: { key: 1 } }
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

// ======= all siler request 
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

router.delete('/slider', async(req, res, next) => {
    if (!req.body._id) return res.json({ status: false, mes: 'Xóa thất bại' });
    var id = mongoose.Types.ObjectId(req.body._id);
    Post.findOneAndUpdate({ _id: id }, req.body).exec(function(err, post) {
        return res.json({ status: true, mes: 'Thành công', post })
    })
})

router.post('/slider/all', async(req, res, next) => {
    Post.find({ postType: 2 }).sort({ videoTitle: 1 }).exec(function(err, posts) {
        res.json(posts);
    });

})

// ======= all one level url request 
router.post('/one-lvl-url', async(req, res, next) => {
    // console.log(req.body);
    // if (!req.body.key || !req.body.value) return res.json({ status: false, mes: 'Vui lòng nhập đầy đủ' });
    var item = new OneLvlUrl({
        idCategory: mongoose.Types.ObjectId(req.body.idCategory),
        local: req.body.local,
        title: req.body.title,
        oneLvlUrl: req.body.oneLvlUrl,
        descriptions: req.body.descriptions,
        content: req.body.content,
        seoKeyWord: req.body.seoKeyWord,
        seoDescriptions: req.body.seoDescriptions,
        seoSocial : req.body.seoSocial
    })

    if(!item.seoSocial['type'] || item.seoSocial['type'] == '')
        item.seoSocial['type'] = 'article';
    if(!item.seoSocial['title'] || item.seoSocial['title'] == '')
        item.seoSocial['title'] = item.title;
    if(!item.seoSocial['description'] || item.seoSocial['description'] == '')
        item.seoSocial['description'] = item.seoDescriptions;

    item.save(function(err, doc) {
        if (err) return res.json({ status: false, mes: 'Lỗi không lưu được, vui lòng thử lại sau', err: err });
        return res.json({ status: true, mes: 'Thành công', doc })
    });

})

router.put('/one-lvl-url', async(req, res, next) => {
    console.log(req.body);
    var doc = await OneLvlUrl.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, req.body);
    res.json({ status: true, mes: 'Thành công', doc });
})

router.post('/all-one-lvl-url', async(req, res, next) => {
    // console.log(req.body);
    var result = await OneLvlUrl.FilterAllDataTable(req.body.aoData);
    // console.log('result', result);
    var records = {
        'draw': req.body.aoData[0].value,
        'recordsTotal': 2,
        'recordsFiltered': 0,
        'data': result
    };

    res.json(records);
})

router.post('/create-snapshot', async(req, res, next) => {
    // console.log(req.body, global.__basedir);
    var abc = path.join(global.__basedir, '../');
    // console.log(abc);
    exec('node ' + abc + 'snapshot-html/index.js ' + req.body.url + ' product-item ' + global.__basedir + '/snapshots', (error, stdout, stderr) => {
        // console.log('error', error);
        // console.log('stdout', stdout);
        // console.log('stderr', stderr);
        if (error) {
            console.log(`error: ${error.message}`);
            return res.json({ status: false, mes: 'thất bại' });
        }
        // if (stderr) {
        //     console.log(`stderr: ${stderr}`);
        //     return res.json({ status: true, mes: 'thành công' });
        // }
        if (stdout) {
            console.log(`stdout: ${stdout}`);
            if (stdout.indexOf('thanh cong') != -1)
                return res.json({ status: true, mes: 'thành công' });
            else
                return res.json({ status: false, mes: 'thất bại' });
        }
    });
})

// ======= download image auto and save
var download_Image = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

router.post('/download-img', async(req, res, next) => {
    console.log(req.body);
    if(req.body.link.indexOf('http') == -1  || req.body.link.indexOf('batdongsantotnhat') != -1) 
        return res.json(req.body.link);
    var dauxanh = config.publicPath + req.body.path;
    var filename = Tool.randomStr(6) + '-' + Tool.randomStr(5) + '-' + Tool.randomStr(6) + '.png' ;
    while (fs.existsSync(dauxanh + '/' + filename)) {
        filename = Tool.randomStr(6) + '-' + Tool.randomStr(5) + '-' + Tool.randomStr(6) + '.png' ;
    }
    download_Image(req.body.link, dauxanh + '/' + filename, function(){
        res.json(req.body.path + '/' + filename);
    });
})


// ======= all ads request 
router.post('/ads', async(req, res, next) => {
    if (!req.body.videoUrl) return res.json({ status: false, mes: 'Bạn chưa chọn hình ảnh' });
    var item = new Post(req.body);
    item.save(function(err, doc) {
        if (err) return res.json({ status: false, mes: 'Lỗi không lưu được, vui lòng thử lại sau', err: err });
        return res.json({ status: true, mes: 'Thành công', doc })
    });
})

router.put('/ads', async(req, res, next) => {
    if (!req.body.videoUrl) return res.json({ status: false, mes: 'Bạn chưa chọn hình ảnh' });
    var id = mongoose.Types.ObjectId(req.body._id);
    delete req.body._id;
    Post.findOneAndUpdate({ _id: id }, req.body).exec(function(err, post) {
        return res.json({ status: true, mes: 'Thành công', post })
    })
})

router.delete('/ads', async(req, res, next) => {
    if (!req.body._id) return res.json({ status: false, mes: 'Xóa thất bại' });
    var id = mongoose.Types.ObjectId(req.body._id);
    Post.findOneAndUpdate({ _id: id }, req.body).exec(function(err, post) {
        return res.json({ status: true, mes: 'Thành công', post })
    })
})


router.post('/ads/all', async(req, res, next) => {
    Post.find({ postType: 3 }).sort({ videoTitle: 1 }).exec(function(err, posts) {
        res.json(posts);
    });

})



router.get('/*', function(req, res, next) {
    res.render("layout/admin");
})


module.exports = router