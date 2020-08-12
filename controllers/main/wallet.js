var router = require('express').Router();
var mongoose = require('mongoose');
var User = require('../../models/user');
const MyWallet = require('../../models/helpers/my-wallet');
const MyFunction = require('../../models/helpers/my-function');
const Middleware = require('../../models/helpers/my-middleware');
const Transaction = require('../../models/transaction');

var isAuthenticated = [Middleware.isAuthenticated];

router.get('/', isAuthenticated, async(req, res, next) => {
    // res.render('layout/frontPage', {});
    res.redirect("/wallet/index");
})

router.get('/test', async(req, res, next) => {
    var root = await User.findOne({ email: 'abc@xxx.com' }).exec();
    // var trans = await MyWallet.SendCashToUser('USD', 'cash', root, 500, 'deposit', 'admin send');
    var trans = await MyWallet.SumWalletTransactionsAmount('USD', 'cash', root, 'deposit', '');
    res.json(trans);
})

router.post('/wallet-balance', isAuthenticated, async(req, res, next) => {
    // (currencyType, walletType, idUser, method, methodType) 
    var amount = await MyWallet.SumWalletTransactionsAmount(req.body.currencyType, req.body.walletType, req.decoded._id, '', '');
    res.json(amount);
})

router.post('/wallet-transactions', isAuthenticated, async(req, res, next) => {
    req.body.transopt['idUser'] = mongoose.Types.ObjectId(req.decoded._id);
    var trans = await Transaction.GetWalletDetailsTransactions(req.body.aoData, req.body.transopt);
    res.json(trans);
})


router.post('/with-draw', isAuthenticated, async(req, res, next) => {
    var amount = parseFloat(req.body.amount);
    if (amount <= 0) return res.json({ status: false, mes: 'Vui lòng nhập số tiền muốn rút' });
    var trans = await MyWallet.AddWithdrawTrans(req.body.currencyType, req.body.type, req.decoded._id, amount);
    res.json(trans);
})

router.post('/resend-withdraw-code', isAuthenticated, async(req, res, next) => {
    var trans = await Transaction.findOne({ _id: mongoose.Types.ObjectId(req.body.item._id) });
    if (trans.status != 2 || trans.method != 'withdraw') return res.json({ status: false, mes: 'Lệnh rút không tồn tại' });
    var abc = await MyFunction.RandomString(20);
    console.log(abc);
    var info = await MyFunction.sendVerifyWithdrawEmail(req.decoded, trans, abc);
    console.log(info);
    if (info && info.info.messageId && info.info.response.indexOf('2.0.0 OK') != -1) {
        var ha = await Transaction.findOneAndUpdate({ _id: trans._id }, { txid: abc }, { new: true });
        console.log(ha);
        res.json(info);
    } else {
        res.json(info);
    }

})

router.post('/verify-withdraw-code', isAuthenticated, async(req, res, next) => {
    // console.log(req.body, req.decoded);
    var trans = await Transaction.findOne({ _id: mongoose.Types.ObjectId(req.body.item._id) });
    if (trans.status != 2 || trans.method != 'withdraw') return res.json({ status: false, mes: 'Lệnh rút không tồn tại' });
    if (trans.txid != req.body.code) return res.json({ status: false, mes: 'Mã xác thực không đúng' });
    var info = await Transaction.findOneAndUpdate({ _id: trans._id }, { status: 0 }, { new: true });
    res.json({ status: true, mes: 'Xác nhận mã rút tiền thành công', info });
})

router.get('/*', isAuthenticated, async(req, res, next) => {
    res.render('layout/frontPage', {});
})

module.exports = router