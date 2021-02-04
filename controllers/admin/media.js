var express = require('express');
var async = require('async');
var fs = require('fs');
var request = require('request');
// var blobUtil = require('blob-util');
// var querystring = require('querystring');
var moment = require('moment');
var passwordHasher = require('aspnet-identity-pw');
var jwt = require('jsonwebtoken');
var Tool = require('../../models/helpers/tool');
var router = express.Router();
const fileManager = require('file-manager-js');
var User = require('../../models/user');
// var Role   = require('../models/role');
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


router.post("/list", function(req, res, next) {
    var dauxanh = config.publicPath + req.body.value;
    dauxanh = dauxanh.replace(/\\/g, '/');
    fileManager.list(dauxanh).then((info) => {
        var kq = { dirs: [], files: [] };
        info.dirs.forEach(element => {
            var xxx = element.replace(/\\/g, '/').replace(dauxanh, '');
            kq.dirs.push(xxx);
        });
        info.files.forEach(element => {
            var xxx = element.replace(/\\/g, '/').replace(dauxanh, '');
            kq.files.push(xxx);
        });
        res.json(kq);
    }).catch((error) => {
        console.log(error);
        res.json({ dirs: [], files: [] });
    });
})

router.post("/list-deep", function(req, res, next) {
    var dauxanh = config.publicPath + req.body.value;
    // console.log(dauxanh);
    fileManager.listDeep(dauxanh).then((info) => {
        var kq = { dirs: [], files: [] };
        info.dirs.forEach(element => {
            console.log('dir', element);
            kq.dirs.push(element.replace(/\\/g, '/').replace(dauxanh, ''));
        });
        info.files.forEach(element => {

            var abc = element.replace(/\\/g, '/').replace(dauxanh, '');
            if (abc.indexOf('/') < 0)
                kq.files.push(abc);
        });
        res.json(kq);
    }).catch((error) => {
        res.json({ dirs: [], files: [] });
    });
})

router.post("/folder", function(req, res, next) {
    console.log(config.publicPath, req.body.path + req.body.name);
    var xxx = (config.publicPath + req.body.path + req.body.name).replace(/\\/g, '/');
    console.log('xxx', xxx);
    if (req.body.type === "add") {
        fileManager.createDir(xxx).then((info) => {
            console.log('ok', info);
            res.json(info);
        }).catch((error) => {
            console.log('error', error);
            res.json(error);
        });
    }
    if (req.body.type === "remove") {
        fileManager.removeDir((config.publicPath + req.body.path).replace(/\\/g, '/'))
            .then((path) => {
                res.json(path);
            })
            .catch((error) => {
                res.json(error);
            })
    }
})


router.post("/uploadfile", function(req, res, next) {
    // console.log(req.body.img);
    if (req.body.type == "upload") {
        var base64Data = req.body.img.data.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
        var imageName = req.body.path + req.body.img.name;
        try {
            if (fs.existsSync(imageName)) {
                //file exists
                res.json({ status: false, mes: 'Ảnh đã tồn tại' });
            } else {
                // console.error('chuẩn bị ghi');
                fs.writeFile(imageName, base64Data, 'base64', function(err) {
                    // console.error('lỗi khi ghi', err);
                    res.json({ status: true, mes: "Upload thành công" });
                });
            }
        } catch (err) {
            // console.log(err);
            res.json({ status: false, mes: err });
        }
    }
    if (req.body.type === 'remove') {
        fileManager.removeFile(req.body.path)
            .then((path) => {
                res.json(path);
            })
            .catch((error) => {
                res.json(error);
            })
    }
})




router.post("/upload-product-img", async function(req, res, next) {
    // var mimeType = req.body.img.data.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
    // console.log('mimeType', mimeType);
    // console.log('upload-product-img', req.body.img);
    if (req.body.type == "upload") {
        var mimeType = req.body.img.data.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0].split('/');
        var base64Data = req.body.img.data.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
        var abc = Tool.randomStr(25);


        try {
            if (!fs.existsSync(req.body.path + req.body.productID)) {
                fs.mkdirSync(req.body.path + req.body.productID);
            }

            var imageName = req.body.path + req.body.productID + '/' + abc + '.' + mimeType[1];
            console.log('file name', imageName);
            if (fs.existsSync(imageName)) {
                //file exists
                res.json({ status: false, mes: 'Ảnh đã tồn tại' });
            } else {
                // console.error('chuẩn bị ghi');
                fs.writeFile(imageName, base64Data, 'base64', function(err) {
                    console.error('lỗi khi ghi', err);
                    res.json({ status: true, mes: "Upload thành công", imageName });
                });
            }
        } catch (err) {
            // console.log(err);
            res.json({ status: false, mes: err });
        }
    }
    if (req.body.type === 'remove') {
        fileManager.removeFile(req.body.path)
            .then((path) => {
                res.json(path);
            })
            .catch((error) => {
                res.json(error);
            })
    }
})



router.get('/*', function(req, res, next) {
    res.render("layout/admin");
})

module.exports = router