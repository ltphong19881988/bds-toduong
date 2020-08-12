// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
const moment = require('moment');
const Transaction = require('./transaction');
const UserSales = require('./user-sales');
const User = require('./user');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var UserInvest = new Schema({
    idUser: { type: Schema.Types.ObjectId, ref: 'User' },
    investPackage: {},
    investTime: {},
    amount: Number,
    contract: {
        id: { type: String, default: '' },
        loainongsan: [],
        images: []
    },
    changeContract: {},
    datecreate: { type: Date, default: Date.now },
    dateApproved: { type: Date },
    dateStart: { type: Date },
    dateEnd: { type: Date },
    status: { type: Boolean, default: false },
    level: Number,
    treeAddress: String,
    idTreeParent: { type: Schema.Types.ObjectId, ref: 'UserInvest' },
});
UserInvest.index({ idUser: 1, investPackage: 1, datecreate: 1 }, { name: "UserInvestIndex", unique: true });
var UserInvest = mongoose.model('UserInvest', UserInvest);
module.exports = UserInvest;


module.exports.Update = function(id, setFields, callback) {
    var query = {
        _id: id,
    };
    UserInvest.update(query, setField, { upsert: true }, function(err, up) {
        if (err)
            callback({ status: false, mes: err });
        callback({ status: true, mes: 'update UserInvest successfully' })
    })
}

module.exports.Delete = function(id, callback) {
    UserInvest.remove({ _id: id }, function(err) {
        if (!err) {
            callback({ status: true, mes: 'delete UserInvest successfully' });
        } else {
            callback({ status: false, mes: err });
        }
    });
}

module.exports.CreateUserInvest = async function(idUser, package, time, idTreeParent, selectedEscrow) {
    const session = await mongoose.startSession();
    session.startTransaction();
    const obIdUser = mongoose.Types.ObjectId(idUser);
    try {
        var contract = {
            id: '',
            loainongsan: [],
            images: []
        };
        selectedEscrow.forEach(element => {
            if (element != false) contract.loainongsan.push(element);
        });
        const opts = { session, new: true };
        var abc = await UserInvest.findOne({ idUser: obIdUser, status: false }).exec();
        if (abc != null) {
            throw new Error('Bạn đang có một gói đầu tư chờ được duyệt');
        }
        // const amount = await MyWallet.SumWalletTransactionsAmount('USD', 'cash', idUser, null, null);
        // console.log(amount);
        // if (amount < package.min) {
        //     throw new Error('Số dư ví tiền mặt không đủ: ');
        // }
        var dateinvest = moment().format();

        var userinvest = new UserInvest({
            idUser: obIdUser,
            investPackage: package,
            investTime: time,
            contract: contract,
            amount: package.min,
            datecreate: dateinvest,
            idTreeParent: idTreeParent
        });
        var a = await userinvest.save(opts);

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Đăng ký thành công', a };
    } catch (error) {
        // console.log(error);
        // If an error occurred, abort the whole transaction and
        // undo any changes that might have happened
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }
}

module.exports.LoopAddUserSales = async function(userinvest, sponsor, list, opts) {
    try {
        if (!sponsor) {
            // console.log('het sponsor', list);
            var abc = await UserSales.insertMany(list, opts);
            return abc;
        } else {
            var item = new UserSales({
                idUser: sponsor._id,
                idUserIncurred: userinvest.idUser,
                idInvest: userinvest._id,
                datecreate: userinvest.dateApproved,
                amount: userinvest.amount,
            });
            var check = await UserInvest.countDocuments({ idUser: sponsor._id, status: true, dateApproved: { $lte: userinvest.dateApproved } });
            console.log(sponsor.username, check, userinvest.idUser.toString(), sponsor._id.toString());
            if (userinvest.idUser.toString() == sponsor._id.toString() || check > 0) {
                // console.log('yay');
                list.push(item);
            }
            var user = await User.findOne({ _id: sponsor.idSponsor });
            return await UserInvest.LoopAddUserSales(userinvest, user, list, opts);
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports.ApproveUserInvest = async function(idUserInvest) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        var userinvest = await UserInvest.findOne({ _id: mongoose.Types.ObjectId(idUserInvest) }).exec();
        if (!userinvest) {
            throw new Error('Gói đầu tư không tồn tại');
        }
        if (userinvest.status) {
            throw new Error('Gói đầu tư đã được xác nhận');
        }
        var dateApprove = moment().format();

        //  Create an deposit transaction
        var tranDeposit = new Transaction({
                currencyType: 'USD', // VND, USD, BTC, ....
                walletType: 'cash', // Tiền mặt hoa hồng
                source: 'plus', // plus, minus
                method: 'deposit', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
                methodType: 'auto process', // if commission we have many type
                idUser: userinvest.idUser,
                amount: userinvest.amount,
                status: 1, // -1 cancel, 0 pending, 1 approved
                idUserInvest: userinvest._id,
                datecreate: dateApprove
            })
            // var a = await tranDeposit.save(opts);
            //  Create an invest transaction
        var tranInvest = new Transaction({
                currencyType: 'USD', // VND, USD, BTC, ....
                walletType: 'cash', // Tiền mặt hoa hồng
                source: 'minus', // plus, minus
                method: 'invest', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
                methodType: userinvest.investPackage.name, // if commission we have many type
                idUser: userinvest.idUser,
                amount: -userinvest.amount,
                status: 1, // -1 cancel, 0 pending, 1 approved
                idUserInvest: userinvest._id,
                datecreate: dateApprove
            })
            // var b = await tranInvest.save(opts);
            //  Create an promotion transaction for invest
        var cpBonus = new Transaction({
                currencyType: 'USD', // VND, USD, BTC, ....
                walletType: 'stock', // Tiền mặt hoa hồng
                source: 'plus', // plus, minus
                method: 'promotion', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
                methodType: 'bonus stock when invest', // if commission we have many type
                idUser: userinvest.idUser,
                amount: userinvest.investPackage.min * userinvest.investTime.stockBonus / 100,
                status: 1, // -1 cancel, 0 pending, 1 approved
                idUserInvest: userinvest._id,
                datecreate: dateApprove
            })
            // var c = await cpBonus.save(opts);
        var lan1 = await Transaction.insertMany([tranDeposit, tranInvest, cpBonus], opts);
        console.log('deposit', lan1);


        // Run User Sales
        var sponsor = await User.findOne({ _id: userinvest.idUser });
        var xyz = await UserInvest.LoopAddUserSales(userinvest, sponsor, [], opts);
        console.log('xyz', xyz);


        // Update userinvest status and add tree infomation
        var treeParent = await UserInvest.findOne({ _id: userinvest.idTreeParent }).exec();
        var update = {
            dateApproved: dateApprove,
            dateStart: dateApprove,
            status: true
        }
        if (treeParent == null) {
            update.level = 0;
            var count = await UserInvest.countDocuments({ idTreeParent: null, status: true }).exec();
            update.treeAddress = count.toString();
        } else {
            update.level = treeParent.level + 1;
            var count = await UserInvest.countDocuments({ idTreeParent: treeParent._id, status: true }).exec();
            update.treeAddress = treeParent.treeAddress + '-' + count;
        }
        console.log('update invest tree');
        await UserInvest.findOneAndUpdate({ _id: userinvest._id }, update, opts);


        //  Create commission for refferall 
        if (treeParent) {
            var sponsorCashTrans = new Transaction({
                currencyType: 'USD', // VND, USD, BTC, ....
                walletType: 'cash', // Tiền mặt hoa hồng
                source: 'plus', // plus, minus
                method: 'commission', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
                methodType: 'sponsor bonus', // if commission we have many type
                idUser: treeParent.idUser,
                idUserIncurred: userinvest.idUser,
                amount: treeParent.investPackage.sponsorCash / 100 * userinvest.amount,
                datecreate: dateApprove,
                idFromTree: userinvest._id,
                idParentTree: treeParent._id,
                status: 1, // -1 cancel, 0 pending, 1 approved
            });
            var sponsorShoppingTrans = new Transaction({
                currencyType: 'USD', // VND, USD, BTC, ....
                walletType: 'shopping', // Tiền mặt hoa hồng
                source: 'plus', // plus, minus
                method: 'commission', // buy, sell, deposit, withdraw, send, get, fee, commission, invest
                methodType: 'sponsor bonus', // if commission we have many type
                idUser: treeParent.idUser,
                idUserIncurred: userinvest.idUser,
                amount: treeParent.investPackage.sponsorShopping / 100 * userinvest.amount,
                datecreate: dateApprove,
                idFromTree: userinvest._id,
                idParentTree: treeParent._id,
                status: 1, // -1 cancel, 0 pending, 1 approved
            })
            await Transaction.insertMany([sponsorCashTrans, sponsorShoppingTrans], opts);
        }




        await session.commitTransaction();
        session.endSession();
        console.log('all done');
        return { status: true, mes: 'Duyệt thành công' };
    } catch (error) {
        console.log(error);
        // If an error occurred, abort the whole transaction and
        // undo any changes that might have happened
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }
}

// This is a promise function
module.exports.getUserInvestDetails = function(id) {
    return UserInvest.aggregate([{
                $match: { _id: id },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "user"
                },
            },
            { $unwind: "$user" }

        ]).exec()
        .then(results => {
            // console.log('results', results)
            return results[0];
        })
        .catch(err => {
            errorHandler.handle('audienceService', err);
            return null;
        });
}

// This is a promise function
module.exports.filterAllUserInvest = async function(body) {
    console.log(body);
    var option = {};
    var packageType = body.aoData[1].value[2].search.value; // body['columns[2][search][value]']
    var datecreateRange = body.aoData[1].value[5].search.value;
    var dateApprovedRange = body.aoData[1].value[6].search.value;
    // console.log(packageType);
    var username = body.aoData[1].value[1].search.value;
    if (packageType) option['investPackage.type'] = parseInt(packageType);

    if (datecreateRange != '') {
        datecreateRange = datecreateRange.split('~');
        var from = null;
        var to = null;
        if (datecreateRange[0] != "") from = new Date(moment(datecreateRange[0], 'YYYY-MM-DD').format());
        if (datecreateRange[1] != "") to = new Date(moment(datecreateRange[1], 'YYYY-MM-DD').add(1, 'days').format());
        if (from != null && to == null) {
            option['datecreate'] = { $gte: from };
        }
        if (from == null && to != null) {
            option['datecreate'] = { $lt: to };
        }
        if (from != null && to != null) {
            option['datecreate'] = { $gte: from, $lt: to };
        }
    }

    if (dateApprovedRange != '') {
        dateApprovedRange = dateApprovedRange.split('~');
        var from = null;
        var to = null;
        if (dateApprovedRange[0] != "") from = new Date(moment(dateApprovedRange[0], 'YYYY-MM-DD').format());
        if (dateApprovedRange[1] != "") to = new Date(moment(dateApprovedRange[1], 'YYYY-MM-DD').add(1, 'days').format());
        if (from != null && to == null) {
            option['dateApproved'] = { $gte: from };
        }
        if (from == null && to != null) {
            option['dateApproved'] = { $lt: to };
        }
        if (from != null && to != null) {
            option['dateApproved'] = { $gte: from, $lt: to };
        }
    }

    if (body.aoData[1].value[7].search.value != '') {
        option['status'] = (body.aoData[1].value[7].search.value == 'true');
    }

    // console.log('option', option);
    return UserInvest.aggregate([{
                $match: option,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "user"
                },
            },
            { $unwind: "$user" },
            {
                $match: { 'user.username': { $regex: username, "$options": "i" } }
            },
            {
                $sort: { type: 1, datecreate: 1 }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: body.aoData[3].value }, { $limit: body.aoData[4].value }],
                    totalCount: [{
                        $count: 'count'
                    }]
                }
            }
            // { $skip: body.aoData[3].value / 4 },
            // { $limit: body.aoData[4].value / 4 },
        ]).exec()
        .then(results => {
            // console.log(results);
            var totalCount = 0;
            if (results[0].totalCount[0]) totalCount = results[0].totalCount[0].count;
            var records = {
                'draw': body.aoData[0].value,
                'recordsTotal': 2,
                'recordsFiltered': totalCount,
                'data': results[0].paginatedResults
            };
            return (records);
        })
        .catch(err => {
            console.log('err', err);
            // errorHandler.handle('audienceService', err);
            var records = {
                'draw': body.aoData[0].value,
                'recordsTotal': 0,
                'recordsFiltered': 0,
                'data': []
            };
            return (records);
        });
}

module.exports.GetFirstInvestmentTree = function(options) {
    let p1 = new Promise((resolve, reject) => {
        UserInvest.aggregate(
            [
                { $match: options },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'idUser',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: 'userinvests',
                        localField: 'idUserInvest',
                        foreignField: '_id',
                        as: 'invest'
                    }
                },
                {
                    $sort: { treeAddress: 1 }
                },
                {
                    $project: {
                        _id: 1,
                        idUser: 1,
                        parent: 1,
                        level: 1,
                        treeAddress: 1,
                        datecreate: 1,
                        investPackage: 1,
                        abc: { $arrayElemAt: ["$user", 0] },
                    }
                },
                {
                    $project: {
                        _id: 1,
                        idUser: 1,
                        parent: 1,
                        level: 1,
                        treeAddress: 1,
                        datecreate: 1,
                        package: '$investPackage.min',
                        type: '$investPackage.type',
                        username: '$abc.username',
                    }
                }
            ]
        ).exec(function(err, result) {
            if (err) reject(err);
            resolve(result);
        });
    })

    return p1;
}

module.exports.GetReferralTree = async function(id) {
    var curTree = await UserInvest.findOne({ _id: id }).exec();
    return UserInvest.aggregate([{
                $match: {
                    status: true,
                    level: curTree.level + 1,
                    treeAddress: { $regex: '^' + curTree.treeAddress + '-' }
                },

            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'idUser',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'userinvests',
                    localField: 'idUserInvest',
                    foreignField: '_id',
                    as: 'invest'
                }
            },
            {
                $sort: { treeAddress: 1 }
            },
            {
                $project: {
                    _id: 1,
                    idUser: 1,
                    parent: 1,
                    level: 1,
                    treeAddress: 1,
                    datecreate: 1,
                    investPackage: 1,
                    abc: { $arrayElemAt: ["$user", 0] },
                }
            },
            {
                $project: {
                    _id: 1,
                    idUser: 1,
                    parent: 1,
                    level: 1,
                    treeAddress: 1,
                    datecreate: 1,
                    package: '$investPackage.min',
                    type: '$investPackage.type',
                    username: '$abc.username',
                }
            }
        ]).exec()
        .then(results => {
            // console.log('results', results)
            return results;
        })
        .catch(err => {
            errorHandler.handle('audienceService', err);
            return [];
        });
}