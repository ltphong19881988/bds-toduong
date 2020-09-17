var router = require('express').Router();
const fs = require('fs');
const moment = require('moment');
const passwordHasher = require('aspnet-identity-pw');
// const fileManager = require('file-manager-js');
const User = require('../../models/user');
const mongoose = require('mongoose');
// const MyWallet = require('../../models/helpers/my-wallet');
const Middleware = require('../../models/helpers/my-middleware');
var secretKey = require('../../config').secret;

var isAuthenticated = [Middleware.isAuthenticated];

router.use('/uploads/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.post('/change-avatar', isAuthenticated, async(req, res, next) => {
    var base64Data = req.body.result.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
    var abc = '/uploads/img/avatar/' + req.decoded.username + '-ava.png';
    var imageName = __basedir + '/public/uploads/img/avatar/' + req.decoded.username + '-ava.png';
    fs.writeFile(imageName, base64Data, 'base64', async function(err) {
        if (err) return res.json({ status: false, mes: err });
        await User.findOneAndUpdate({ username: req.decoded.username }, { 'info.avatar': abc }, {
            new: true
        }).exec(function(err, doc) {
            if (err) return res.json({ status: false, mes: err });
        });
        res.json({ status: true, mes: "Upload thành công", path: abc });
    });

})

router.get('/', isAuthenticated, async(req, res, next) => {
    // res.render('layout/frontPage', {});
    res.redirect("/user/index");
})

router.get('/user-info', isAuthenticated, async(req, res, next) => {
    var user = await User.findOne({ _id: mongoose.Types.ObjectId(req.decoded._id) }, '_id username email sponsor idSponsor code parentCode fullname info bankInfo').exec();
    user._doc['country'] = user._doc.info.country;
    user._doc['serverTime'] = moment().format('DD-MM-YYYY HH:mm:ss');
    res.json(user._doc);
})

router.post('/change-password', isAuthenticated, async(req, res, next) => {
    if (!req.body.currentPassword) return res.json({ status: false, mes: 'Vui lòng nhập mật khẩu hiện tại' });
    if (!req.body.newPassword) return res.json({ status: false, mes: 'Vui lòng nhập mật khẩu mới' });
    if (!req.body.confirmPassword) return res.json({ status: false, mes: 'Vui lòng nhập xác nhận mật khẩu mới' });
    if (req.body.newPassword != req.body.confirmPassword) return res.json({ status: false, mes: 'Xác nhận mật khẩu không đúng' });
    var user = await User.findOne({ username: req.decoded.username });
    if (!passwordHasher.validatePassword(req.body.currentPassword, user.password)) {
        return res.json({ status: false, mes: 'Mật khẩu hiện tại không đúng' });
    } else {
        var abc = passwordHasher.hashPassword(req.body.newPassword);
        User.findOneAndUpdate({ username: req.decoded.username }, { password: abc }, { new: true }, function(err, doc) {
            console.log(err, doc);
            res.json({ status: true, mes: 'Đổi mật khẩu thành công' });
        })
    }

})

var mwUpdate = [Middleware.isAuthenticated, Middleware.ValidateUpdateUserProfile];
router.post('/user-info', mwUpdate, async(req, res, next) => {
    const filter = { _id: mongoose.Types.ObjectId(req.decoded._id) };
    const update = { bankInfo: req.body.bankInfo, info: req.body.info, fullname: req.body.fullname };
    await User.findOneAndUpdate(filter, update, {
        new: true
    }).exec(function(err, doc) {
        if (err) return res.json({ status: false, mes: err });
        res.json({ status: true, mes: "Thành công" });
    });

})

router.get('/logout', isAuthenticated, async(req, res, next) => {
    var id = mongoose.Types.ObjectId(req.decoded._id);
    User.findOne({ id: id }).exec(function(err, result) {
        var token = "";
        if (result) {
            token = jwt.sign(result._doc, secretKey, {
                expiresIn: 0 // expires in 24 hours
            });
        }
        res.cookie('x-access-token', token, { expires: new Date(Date.now()) });
        res.redirect("/");
    })
})

router.get('/init-member-tree', isAuthenticated, async(req, res, next) => {
    var abc = await User.InitMemberTree(req.decoded._id);
    res.json(abc);
})
router.get('/get-referral-tree/:id', isAuthenticated, async(req, res, next) => {
    res.json(await User.ListF1(req.params.id));
})

router.get('/*', isAuthenticated, async(req, res, next) => {
    res.render('layout/frontPage', {});
})

module.exports = router