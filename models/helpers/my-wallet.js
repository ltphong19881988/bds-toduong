const mongoose = require('mongoose');
const moment = require('moment');
const Transaction = require('../transaction');
const User = require('../user');
const UserInvest = require('../userinvest');
const InvestmentTree = require('../investmenttree');
var MyWallet = {};
module.exports = MyWallet;


module.exports.SendCashToUser = function(currencyType, walletType, user, amount, method, methodType) {
    var trans = new Transaction({
        currencyType: currencyType, // VND, USD, BTC, ....
        walletType: walletType, // Tiền mặt hoa hồng
        source: 'plus', // plus, minus
        method: method, // buy, sell, deposit, withdraw, send, get, fee, commission, invest
        methodType: methodType, // if commission we have many type
        // walletAmount: Number,
        idUser: user._id,
        // idUserIncurred: Schema.Types.ObjectId,      
        // address: String, // address of btc or vnc
        amount: amount,
        status: 1, // -1 cancel, 0 pending, 1 approved
        // txid: String,
        // description: String,
        // real: { type: Boolean, default: true }
    })

    let p1 = new Promise((resolve, reject) => {
        trans.save(function(err, doc) {
            if (err) reject(err);
            resolve(doc);
        })
    })

    return p1;

}

module.exports.GetWalletTransactions = function(currencyType, walletType, idUser, method, methodType) {
    let options = { idUser: mongoose.Types.ObjectId(idUser) };
    if (currencyType) options.currencyType = currencyType;
    if (walletType) options.walletType = walletType;
    if (method) options.method = method;
    if (methodType) options.methodType = methodType;
    // console.log(options);
    let p1 = new Promise((resolve, reject) => {
        Transaction.aggregate(
            [
                { $match: options },
                { $sort: { datecreate: -1 } }
            ]
        ).exec(function(err, result) {
            if (err) reject(err);
            resolve(result);
        });
    })

    return p1;

}

module.exports.SumWalletTransactionsAmount = function(currencyType, walletType, idUser, method, methodType) {
    // Type of idUser is string ( we got it when decode jwt ), so we need convert it to ObjectId .
    let options = { idUser: mongoose.Types.ObjectId(idUser) };
    if (currencyType) options.currencyType = currencyType;
    if (walletType) options.walletType = walletType;
    if (method) options.method = method;
    if (methodType) options.methodType = methodType;
    // console.log(options);
    let p1 = new Promise((resolve, reject) => {
        Transaction.aggregate(
            [
                { $match: options },
                { $sort: { datecreate: -1 } },
                {
                    $group: {
                        _id: idUser,
                        total: { $sum: "$amount" },
                    }
                }
            ]
        ).exec(function(err, result) {
            if (err) reject(err);
            if (result.length == 0) resolve(0);
            else resolve(result[0].total);
        });
    })

    return p1;
}

module.exports.LoopInterestPerInterest = async function(curInvest, parentInvest, list, amount, datecreate, opts) {
    if (!parentInvest) {
        if (list.length > 0) {
            var abc = await Transaction.insertMany(list, opts);
            console.log('count interest per interest', abc);
            return abc;
        }
    } else {
        var percent = 0;
        if (parentInvest.level == (curInvest.level - 1)) percent = parentInvest.investPackage.referralBonus.F1;
        if (parentInvest.level == (curInvest.level - 2)) percent = parentInvest.investPackage.referralBonus.F2;
        if (parentInvest.level == (curInvest.level - 3)) percent = parentInvest.investPackage.referralBonus.F3;
        if (parentInvest.level <= (curInvest.level - 4) && parentInvest.level >= (curInvest.level - 10)) percent = parentInvest.investPackage.referralBonus.F4;
        if (parentInvest.level - curInvest.level > 10) {
            if (list.length > 0) {
                var abc = await Transaction.insertMany(list, opts);
                console.log('count interest per interest', abc);
                return abc;
            }
        }
        var tran = new Transaction({
            currencyType: 'USD', // VND, USD, BTC, ....
            walletType: 'cash', // Tiền mặt hoa hồng
            source: 'plus', // plus, minus
            method: 'interest per interest', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
            methodType: 'auto process', // if commission we have many type
            idUser: parentInvest.idUser,
            idUserIncurred: curInvest.idUser,
            amount: amount * percent / 100,
            status: 1, // -1 cancel, 0 pending, 1 approved
            idUserInvest: curInvest._id,
            datecreate: datecreate
        })
        list.push(tran);
        var abc = await UserInvest.findOne({ _id: parentInvest.idTreeParent });
        return await MyWallet.LoopInterestPerInterest(curInvest, abc, list, amount, datecreate);
    }

}

module.exports.RunInterest = async function(userinvest, datecreate, from, to) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        // var from = moment(moment(datecreate).format('DD') + '-' + moment(datecreate).format('MM') + '-' + moment(datecreate).format('YYYY'), 'DD-MM-YYYY').format();
        // var from = moment(datecreate).add(-1, 'minutes').format();
        // var to = moment(datecreate).add(1, 'minutes').format();
        // console.log('from', from, 'to', to);

        var check = await Transaction.find({
            idUser: userinvest.idUser,
            idUserInvest: userinvest._id,
            walletType: 'commission',
            method: 'interest',
            datecreate: { $lt: to, $gte: from }
        });
        // console.log('check', check);
        if (check.length > 0) {
            throw new Error('Đã chạy gói này lúc ' + datecreate.toString());
        }
        //  Create an deposit transaction
        var tranDeposit = new Transaction({
            currencyType: 'USD', // VND, USD, BTC, ....
            walletType: 'commission', // Tiền mặt hoa hồng
            source: 'plus', // plus, minus
            method: 'interest', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
            methodType: 'auto process', // if commission we have many type
            idUser: userinvest.idUser,
            amount: (userinvest.amount * userinvest.investPackage.interestCash / 100) / 30,
            status: 1, // -1 cancel, 0 pending, 1 approved
            idUserInvest: userinvest._id,
            datecreate: datecreate
        });
        var trans2 = new Transaction({
            currencyType: 'USD', // VND, USD, BTC, ....
            walletType: 'shopping', // Tiền mặt hoa hồng
            source: 'plus', // plus, minus
            method: 'interest', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
            methodType: 'auto process', // if commission we have many type
            idUser: userinvest.idUser,
            amount: (userinvest.amount * userinvest.investPackage.interestShopping / 100) / 30,
            status: 1, // -1 cancel, 0 pending, 1 approved
            idUserInvest: userinvest._id,
            datecreate: datecreate
        });
        var trans3 = new Transaction({
            currencyType: 'USD', // VND, USD, BTC, ....
            walletType: 'travel', // Tiền mặt hoa hồng
            source: 'plus', // plus, minus
            method: 'interest', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
            methodType: 'auto process', // if commission we have many type
            idUser: userinvest.idUser,
            amount: (userinvest.amount * userinvest.investPackage.interestTravel / 100) / 30,
            status: 1, // -1 cancel, 0 pending, 1 approved
            idUserInvest: userinvest._id,
            datecreate: datecreate
        });
        var trans4 = new Transaction({
            currencyType: 'USD', // VND, USD, BTC, ....
            walletType: 'edu', // Tiền mặt hoa hồng
            source: 'plus', // plus, minus
            method: 'interest', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
            methodType: 'auto process', // if commission we have many type
            idUser: userinvest.idUser,
            amount: (userinvest.amount * userinvest.investPackage.interestEducation / 100) / 30,
            status: 1, // -1 cancel, 0 pending, 1 approved
            idUserInvest: userinvest._id,
            datecreate: datecreate
        });
        var trans5 = new Transaction({
            currencyType: 'USD', // VND, USD, BTC, ....
            walletType: 'stock', // Tiền mặt hoa hồng
            source: 'plus', // plus, minus
            method: 'interest', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
            methodType: 'auto process', // if commission we have many type
            idUser: userinvest.idUser,
            amount: (userinvest.amount * userinvest.investPackage.interestStock / 100) / 30,
            status: 1, // -1 cancel, 0 pending, 1 approved
            idUserInvest: userinvest._id,
            datecreate: datecreate
        });
        var listTrans = [tranDeposit, trans2, trans3, trans4, trans5];
        await Transaction.insertMany(listTrans, opts);
        var parentInvest = await UserInvest.findOne({ _id: userinvest.idTreeParent });
        await MyWallet.LoopInterestPerInterest(userinvest, parentInvest, [], tranDeposit.amount, datecreate, opts);


        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Đăng ký thành công' };
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }
}

module.exports.AddWithdrawTrans = async function(currencyType, walletType, idUser, amount) {
    idUser = mongoose.Types.ObjectId(idUser);
    // console.log(idUser);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        // console.log('opts', opts)
        var user = await User.findOne({ _id: idUser }).session(session);
        if (user.free == 0) {
            throw new Error('Bạn đang có giao dịch chưa xử lý xong');
        }
        // when multi request it will be erro WriteConflict. just 1 request success
        await User.findOneAndUpdate({ _id: user._id }, { free: 0 }, opts);
        var balance = await MyWallet.SumWalletTransactionsAmount(currencyType, walletType, idUser, '', '');
        if (amount > balance) {
            throw new Error('Số tiền muốn rút lớn hơn số dư');
        }

        var tran = new Transaction({
            currencyType: currencyType, // VND, USD, BTC, ....
            walletType: walletType, // Tiền mặt hoa hồng
            source: 'minus', // plus, minus
            method: 'withdraw', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
            methodType: 'withdraw ' + walletType, // if commission we have many type
            idUser: idUser,
            amount: -amount,
            status: 0, // -1 cancel, 0 pending, 1 approved, 2 wait mail verify
            description: 'des',
        });
        var doc = await tran.save(opts);
        console.log('save doc', doc);
        await User.findOneAndUpdate({ _id: idUser }, { free: 1 }, opts);

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Yêu cầu rút tiền thành công.', doc };
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }


}