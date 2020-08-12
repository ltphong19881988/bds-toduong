var router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../../models/user');
const InvestmentPackage = require('../../models/investmentpackage');
const InvestmentTime = require('../../models/investmenttime');
const InvestmentTree = require('../../models/investmenttree');
const UserInVest = require('../../models/userinvest');
const AppConfig = require('../../models/app-config');

const Middleware = require('../../models/helpers/my-middleware');
const MyWallet = require('../../models/helpers/my-wallet');

var isAuthenticated = [Middleware.isAuthenticated];

router.get('/', isAuthenticated, async(req, res, next) => {
    // res.render('layout/frontPage', {});
    res.redirect("/investment/index");
})

router.get('/get-all-packages', isAuthenticated, async(req, res, next) => {
    var type = req.query.type;
    var packages = await InvestmentPackage.find({ type: type }).sort({ priority: 1 }).exec();
    res.json(packages);
    // InvestmentPackage.Init(function(result) {
    //     res.json(result)
    // })
})

router.get('/get-all-user-invest', isAuthenticated, async(req, res, next) => {
    UserInVest.aggregate(
        [{
                $match: {
                    idUser: mongoose.Types.ObjectId(req.decoded._id)
                }
            },
            { $sort: { datecreate: 1 } }
        ]
    ).exec(function(err, result) {
        res.json(result);
    });

})

router.get('/init-invest-tree-parent', isAuthenticated, async(req, res, next) => {
    // console.log(req.decoded);
    var sponsor = null;
    if (req.decoded.sponsor != null && req.decoded.sponsor != '') {
        sponsor = await User.findOne({ username: req.decoded.sponsor }).exec();
    }
    var userinvest = await UserInVest.GetFirstInvestmentTree({
        idUser: mongoose.Types.ObjectId(req.decoded._id),
        status: true
    });
    // console.log(userinvest, sponsor);
    if (userinvest.length > 0) {
        return res.json(userinvest[0]);
    } else {
        if (sponsor != null) {
            var sponsorinvest = await UserInVest.GetFirstInvestmentTree({
                idUser: sponsor._id,
                status: true
            });
            // console.log('sponsorinvest', sponsorinvest);
            if (sponsorinvest.length > 0) {
                return res.json(sponsorinvest[0]);
            } else {
                return res.json(null);
            }
        } else {
            return res.json(null);
        }
    }

})

router.get('/get-referral-tree/:id', isAuthenticated, async(req, res, next) => {
    // console.log(req.decoded);
    var id = mongoose.Types.ObjectId(req.params.id);
    var list = await UserInVest.GetReferralTree(id);
    res.json(list);
})

router.get('/site-config/:key', isAuthenticated, async(req, res, next) => {
    return res.json(await AppConfig.findOne({ key: req.params.key }));
})

router.post('/register-package', isAuthenticated, async(req, res, next) => {
    // console.log(req.body);
    var idTreeParent = null;
    if (req.body.treeparent) {
        idTreeParent = mongoose.Types.ObjectId(req.body.treeparent._id);
    }
    var package = await InvestmentPackage.findOne({ _id: mongoose.Types.ObjectId(req.body.package._id) }).exec();
    var time = await InvestmentTime.findOne({ month: req.body.package.month }).exec();
    var amount = await UserInVest.CreateUserInvest(req.decoded._id, package, time, idTreeParent, req.body.selectedEscrow);
    res.json(amount);
})

router.delete('/delete-invest-package/:id', isAuthenticated, async(req, res, next) => {
    // console.log(req.params.id);
    var id = mongoose.Types.ObjectId(req.params.id);
    var abc = await UserInVest.findOne({ _id: id });
    if (!abc) return res.json({ status: false, mes: "Gói đầu tư không tồn tại, vui lòng tải lại trang web" });
    if (abc.status == true || abc.dateApproved != null) {
        return res.json({ status: false, mes: "Gói đầu tư đã được xác nhận, không thể hủy bỏ" });
    } else {
        var xyz = await UserInVest.deleteOne({ _id: id });
        console.log('delete', xyz);
        return res.json({ status: true, mes: "Gói đầu tư đã được hủy bỏ" });
    }
})

router.get('/get-escrow-price', isAuthenticated, async(req, res, next) => {
    var tieu = new Promise((resolve, reject) => {
        resolve(AppConfig.findOne({ key: 'gia-tieu' }))
    });
    var cafe = new Promise((resolve, reject) => {
        resolve(AppConfig.findOne({ key: 'gia-cafe' }))
    });
    var dieu = new Promise((resolve, reject) => {
        resolve(AppConfig.findOne({ key: 'gia-dieu' }))
    });

    Promise.all([tieu, cafe, dieu]).then(function(values) {
        var result = {
            tieu: values[0],
            dieu: values[2],
            cafe: values[1]
        }
        res.json(result);
    });


})

router.get('/*', isAuthenticated, async(req, res, next) => {
    // console.log('all page');
    res.render('layout/frontPage', {});
})

module.exports = router