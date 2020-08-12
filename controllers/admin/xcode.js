var express = require('express');
var async = require('async');
var moment = require('moment');
const mongoose = require('mongoose');
const fs = require('fs');
var passwordHasher = require('aspnet-identity-pw');
var jwt = require('jsonwebtoken');
var xl = require('excel4node');
var passwordHasher = require('aspnet-identity-pw');
var router = express.Router();
const User = require('../../models/user');
const UserInvest = require('../../models/userinvest');
const Transaction = require('../../models/transaction');
const UserSales = require('../../models/user-sales');
var InvestmentPackage = require('../../models/investmentpackage');
const Middleware = require('../../models/helpers/my-middleware');
const MyWallet = require('../../models/helpers/my-wallet');
const MyFunction = require('../../models/helpers/my-function');

var config = require('../../config'); // get our config file
var secretKey = config.secret;

router.get("/index", function(req, res, next) {
    var data = {
        title: 'List member',
    }
    res.render("admin/member/index", data);
})

router.post('/all-members', async(req, res, next) => {
    var abc = await User.getAllMember('member', req.body.aoData);
    res.json(abc);
})

router.post('/all-user-invest', async(req, res, next) => {
    // console.log(req.body);
    var abc = await UserInvest.filterAllUserInvest(req.body);
    // var records = {
    //     'draw': req.body.aoData[0].value,
    //     'recordsTotal': 1000,
    //     'recordsFiltered': abc.totalCount[0].count,
    //     'data': abc.paginatedResults
    // };
    res.json(abc);
})

var Check_Approved_UserInvest = async function(id) {
    var ui = await UserInvest.findOne({ _id: id });
    console.log('user invest ', ui);
    // var listTrans = await Transaction.find({ idUserInvest: id });
    var result = {
        idInvest: id,
        depositTrans: true,
        investTrans: true,
        stockTrans: true,
    }
    var depositTrans = new Promise((resolve, reject) => {
        resolve(Transaction.findOne({ idUserInvest: id, walletType: 'cash', method: 'deposit' }))
    });
    var investTrans = new Promise((resolve, reject) => {
        resolve(Transaction.findOne({ idUserInvest: id, walletType: 'cash', method: 'invest' }))
    });
    var stockTrans = new Promise((resolve, reject) => {
        resolve(Transaction.findOne({ idUserInvest: id, walletType: 'stock', method: 'promotion' }))
    });
    var addSales = new Promise((resolve, reject) => {
        resolve(UserSales.countDocuments({ idInvest: id }))
    });
    var arr = [depositTrans, investTrans, stockTrans, addSales];
    // var treeParent = await UserInvest.findOne({ _id: ui.idTreeParent }).exec();
    if (ui.idTreeParent) {
        result['cashBonus'] = true;
        result['shoppingBonus'] = true;
        var cashBonus = new Promise((resolve, reject) => {
            resolve(Transaction.findOne({ idFromTree: id, walletType: 'cash', method: 'commission' }))
        });
        var shoppingBonus = new Promise((resolve, reject) => {
            resolve(Transaction.findOne({ idFromTree: id, walletType: 'shopping', method: 'commission' }))
        });
        arr.push(cashBonus, shoppingBonus);
    }

    return new Promise((resolve, reject) => {
        Promise.all(arr).then(function(values) {
            console.log(values);
            if (!values[0]) result.depositTrans = false;
            if (!values[1]) result.investTrans = false;
            if (!values[2]) result.stockTrans = false;
            result['addSales'] = values[3];
            if (ui.idTreeParent && !values[4]) result['cashBonus'] = false;
            if (ui.idTreeParent && !values[5]) result['shoppingBonus'] = false;
            resolve(result);
        });
    });

}

router.get('/check-approved-user-invest/:id', async(req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    res.json(await Check_Approved_UserInvest(id));
})

router.get('/check-all-approved-user-invest', async(req, res, next) => {
    var list = await UserInvest.find({ status: true }).sort({ dateApproved: 1 });
    var promises = [];
    list.forEach(element => {
        promises.push(Check_Approved_UserInvest(element.id));
    });
    Promise.all(promises)
        .then((values) => {
            res.json(values);
        })
        .catch((e) => {
            console.log(e);
            res.json(e);
            // handle errors here
        });
})

router.get('/add-sales-user-invest/:id', async(req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    var count = await UserSales.countDocuments({ idInvest: id });
    if (count > 0) {
        console.log('da ton tai');
        await UserSales.deleteMany({ idInvest: id });
        console.log('xoa het cu');
    }
    var userinvest = await UserInvest.findOne({ _id: id });
    var sponsor = await User.findOne({ _id: userinvest.idUser });
    var xyz = await UserInvest.LoopAddUserSales(userinvest, sponsor, [], {});
    console.log('xyz', xyz);
    res.json('done');
})








router.get('/*', function(req, res, next) {
    var data = {
        title: 'List member',
    }
    res.render("layout/admin", data);
})




module.exports = router