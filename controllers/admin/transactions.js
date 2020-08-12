var express = require('express');
var async = require('async');
var moment = require('moment');
var mongoose = require('mongoose');
const fs = require('fs');
var xl = require('excel4node');
var router = express.Router();
var User = require('../../models/user');
var Transaction = require('../../models/transaction');
var Commission = require('../../models/commission');
var MyFunction = require('../../models/helpers/my-function');
// var Role   = require('../models/role');
// var UserRole   = require('../models/userrole');
// var UserAuth   = require('../models/userauth');

var config = require('../../config'); // get our config file
var secretKey = config.secret;


var getOptions = function(req) {
    var option = {};

    if (req.body.walletType != null && req.body.walletType != '' && req.body.walletType != ' ')
        option.walletType = { $regex: req.body.walletType, "$options": "i" };
    if (req.body.type != null && req.body.type != '' && req.body.type != ' ')
        option.type = { $regex: req.body.type, "$options": "i" };
    if (req.body.address != null && req.body.address != '' && req.body.address != ' ')
        option.address = { $regex: req.body.address, "$options": "i" };
    if (req.body.txid != null && req.body.txid != '' && req.body.txid != ' ')
        option.txid = { $regex: req.body.txid, "$options": "i" };
    if (req.body.source != null && req.body.source != '' && req.body.source != ' ')
        option.source = { $regex: req.body.source, "$options": "i" };

    if (req.body.datecreate_from != '' && req.body.datecreate_from != null) {
        var from = new Date(moment(req.body.datecreate_from, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss'));
        var to = new Date(moment(req.body.datecreate_from, 'DD/MM/YYYY').add(1, 'days').format('YYYY-MM-DD HH:mm:ss'));
        if (req.body.datecreate_to != '' && req.body.datecreate_to != null) {
            to = new Date(moment(req.body.datecreate_to, 'DD/MM/YYYY').add(1, 'days').format('YYYY-MM-DD HH:mm:ss'));
        }
        option.datecreate = { $gt: from, $lt: to };
    }
    // console.log(option);
    return option;
}

var checkUserFilter = function(option, req, callback) {
    var listUser = [];
    if (req.body["userdetail.username"] != null && req.body["userdetail.username"] != '' && req.body["userdetail.username"] != ' ') {
        User.find({ username: { $regex: req.body["userdetail.username"], "$options": "i" } }, function(err, result) {
            result.forEach(element => {
                listUser.push(element._id);
            });
            if (listUser.length > 0) {
                option.idUser = { $in: listUser };
            }
            callback(1);
        }).select({ '_id': 1 });
    } else {
        callback(0)
    }
}


router.post('/all-user-withdraw', async(req, res, next) => {
    var username = req.body.aoData[1].value[1].search.value;
    var options = {
        method: /withdraw/
    };
    Transaction.aggregate([
        { $match: options },
        {
            $lookup: {
                from: "users",
                localField: "idUser",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $match: { 'user.username': { $regex: username, "$options": "i" } }
        },
        { $sort: { datecreate: 1 } },
        {
            $facet: {
                paginatedResults: [{ $skip: req.body.aoData[3].value }, { $limit: req.body.aoData[4].value }],
                totalCount: [{
                    $count: 'count'
                }]
            }
        }
    ]).exec(function(err, result) {
        // console.log(err, result);
        var totalCount = 0;
        if (result[0].totalCount[0]) totalCount = result[0].totalCount[0].count;
        if (err) result = [];
        var records = {
            'draw': req.body.aoData[0].value,
            'recordsTotal': 2,
            'recordsFiltered': totalCount,
            'data': result[0].paginatedResults
        };
        res.json(records);
    });
})

router.post('/all-transactions-index', async(req, res, next) => {
    console.log(req.body);
    var abc = await AllTransactionsIndex(req.body.aoData);
    res.json(abc);
})

router.get('/transaction-details/:id', async function(req, res, next) {
    var id = mongoose.Types.ObjectId(req.params.id);
    Transaction.aggregate([{
            $match: {_id : id},
        },
        {
            $lookup: {
                from: "users",
                localField: "idUser",
                foreignField: "_id",
                as: "user"
            },
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        }
    ]).exec()
    .then((results) => {
        res.json(results[0]);
    })
    .catch((err) => {
        return null;
    })
    
})

router.put('/transaction-details/:id', async function(req, res, next) {
    var trans = await Transaction.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
    trans.contract.id = req.body.contract.id;
    await MyFunction.verifyFolderUpload(__basedir + '/public/uploads/transactionContractImages/', trans._id);
    if (req.body.images) {
        var promises = req.body.images.map(function(val) {
            var base64Data = val.data.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
            var abc = '/uploads/transactionContractImages/' + trans._id + '/' + val.name;
            var imageName = __basedir + '/public/uploads/transactionContractImages/' + trans._id + '/' + val.name;
            var p = new Promise((resolve, reject) => {
                fs.writeFile(imageName, base64Data, 'base64', function(err) {
                    if (err) reject(err);
                    resolve(abc);
                });
            })
            return p;
        });
        await Promise.all(promises).then(function(data) {
            // console.log(data);
            trans.contract.images = data;
        }).catch(function(err) {
            // error here 
            console.log(err);
            return res.json({ status: false, mes: 'Upload ảnh thất bại' });
        });
    }
    var item = await Transaction.findOneAndUpdate({ _id: trans._id }, { contract: trans.contract, status : parseInt(req.body.status) }, { new: true });
    res.json({ status: true, mes: 'Thay đổi thành công', item });
})


router.post('/count-all-transactions-index', function(req, res, next) {
    var option = getOptions(req);
    async.parallel({
        checkUser: function(callback) {
            checkUserFilter(option, req, function(result) {
                callback(null, result);
            })
        }
    }, function(err, results) {
        SumTransactionsAmountFilters(option, function(result) {
            if (result.length > 0) {
                res.json(result[0]);
            } else {
                res.json({ "_id": null, "totalAmount": 0, "count": 0 });
            }

        })
    })
})

var AllTransactionsIndex = async function(aoData) {
    var options = {};
    var username = aoData[1].value[1].search.value;
    var walletType = aoData[1].value[2].search.value;
    if (walletType != '') options['walletType'] = walletType;
    var method = aoData[1].value[3].search.value;
    if (method != '') options['method'] = method;
    var datecreateRange = aoData[1].value[5].search.value;
    if (datecreateRange != '') {
        datecreateRange = datecreateRange.split('~');
        var from = null;
        var to = null;
        if (datecreateRange[0] != "") from = new Date(moment(datecreateRange[0], 'YYYY-MM-DD').format());
        if (datecreateRange[1] != "") to = new Date(moment(datecreateRange[1], 'YYYY-MM-DD').add(1, 'days').format());
        if (from != null && to == null) {
            options['datecreate'] = { $gte: from };
        }
        if (from == null && to != null) {
            options['datecreate'] = { $lt: to };
        }
        if (from != null && to != null) {
            options['datecreate'] = { $gte: from, $lt: to };
        }
    }

    if (aoData[1].value[6].search.value != '') {
        options['status'] = (parseInt(aoData[1].value[6].search.value));
    }

    return Transaction.aggregate([{
                $match: options,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "user"
                },
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: { 'user.username': { $regex: username, "$options": "i" } }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: aoData[3].value }, { $limit: aoData[4].value }],
                    totalCount: [{
                        $count: 'count'
                    }]
                }
            }
        ]).exec()
        .then((results) => {
            console.log(results);
            var totalCount = 0;
            if (results[0].totalCount[0]) totalCount = results[0].totalCount[0].count;
            var records = {
                'draw': aoData[0].value,
                'recordsTotal': 2,
                'recordsFiltered': totalCount,
                'data': results[0].paginatedResults
            };
            return (records);
        })
        .catch((err) => {
            console.log(err);
            var records = {
                'draw': aoData[0].value,
                'recordsTotal': 0,
                'recordsFiltered': 0,
                'data': []
            };
            return (records);
        })
}

function CountTransactionsFilters(option, callback) {
    Transaction.aggregate([{
            $match: option,
        },
        {
            $lookup: {
                from: "users",
                localField: "idUser",
                foreignField: "_id",
                as: "userdetail"
            },
        },
        {
            $project: {
                "userdetail": 1,
                "address": 1,
                "walletType": 1,
                "type": 1,
                "amount": 1,
                "datecreate": 1,
                "status": 1,
                "txid": 1,
                "source": 1,
            }
        },
        //{ $group: { _id: null, count: { $sum: 1 } } },
        {
            $count: "passing_scores"
        }
    ], function(err, result) {
        if (result.length == 0) {
            callback(0);
        } else {
            callback(result[0].passing_scores);
        }

    })
}

function SumTransactionsAmountFilters(option, callback) {
    Transaction.aggregate([{
            $match: option,
        },
        {
            $lookup: {
                from: "users",
                localField: "idUser",
                foreignField: "_id",
                as: "userdetail"
            },
        },
        {
            $project: {
                "userdetail": 1,
                "address": 1,
                "walletType": 1,
                "type": 1,
                "amount": 1,
                "datecreate": 1,
                "status": 1,
                "txid": 1,
                "source": 1,
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
    ], function(err, result) {
        callback(result);

    })
}

router.get('/sum-transactions-amount', function(req, res, next) {
    var option = getOptions(req);
    async.parallel({
        checkUser: function(callback) {
            checkUserFilter(option, req, function(result) {
                callback(null, result);
            })
        }
    }, function(err, results) {
        SumTransactionsAmountFilters(option, function(result) {
            res.json(result);
        })
    })
})

router.post('/transactions-to-excel', function(req, res, next) {
    var wb = new xl.Workbook();
    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Lich su giao dich');
    // var ws2 = wb.addWorksheet('Sheet 2');
    // Create a reusable style
    var style = wb.createStyle({
        font: {
            color: '#1b418b',
            size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    var option = {};
    if (req.body.walletType != null && req.body.walletType != '' && req.body.walletType != ' ')
        option.walletType = { $regex: req.body.walletType, "$options": "i" };
    if (req.body.type != null && req.body.type != '' && req.body.type != ' ')
        option.type = { $regex: req.body.type, "$options": "i" };
    if (req.body.address != null && req.body.address != '' && req.body.address != ' ')
        option.address = { $regex: req.body.address, "$options": "i" };
    if (req.body.txid != null && req.body.txid != '' && req.body.txid != ' ')
        option.txid = { $regex: req.body.txid, "$options": "i" };
    if (req.body.source != null && req.body.source != '' && req.body.source != ' ')
        option.source = { $regex: req.body.source, "$options": "i" };

    if (req.body.datecreate_from != '' && req.body.datecreate_from != null) {
        var from = new Date(moment(req.body.datecreate_from, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss'));
        var to = new Date(moment(req.body.datecreate_from, 'DD/MM/YYYY').add(1, 'days').format('YYYY-MM-DD HH:mm:ss'));
        if (req.body.datecreate_to != '' && req.body.datecreate_to != null) {
            to = new Date(moment(req.body.datecreate_to, 'DD/MM/YYYY').add(1, 'days').format('YYYY-MM-DD HH:mm:ss'));
        }
        option.datecreate = { $gt: from, $lt: to };
    }
    var listUser = [];

    async.parallel({
        checkUser: function(callback) {
            if (req.body["userdetail.username"] != null && req.body["userdetail.username"] != '' && req.body["userdetail.username"] != ' ') {
                User.find({ username: { $regex: req.body["userdetail.username"], "$options": "i" } }, function(err, result) {
                    result.forEach(element => {
                        listUser.push(element._id);
                    });
                    if (listUser.length > 0) {
                        option.idUser = { $in: listUser };
                    }
                    callback(null, 1);
                }).select({ '_id': 1 });
            } else {
                callback(null, 0)
            }
        }
    }, function(err, results) {
        Transaction.aggregate([{
                $match: option,
            },
            {
                $lookup: {
                    from: "users",
                    localField: "idUser",
                    foreignField: "_id",
                    as: "userdetail"
                },
            },
            {
                $project: {
                    "userdetail": 1,
                    "address": 1,
                    "walletType": 1,
                    "type": 1,
                    "amount": 1,
                    "datecreate": 1,
                    "status": 1,
                    "txid": 1,
                    "source": 1,
                }
            },
        ], function(err, result) {
            var row = 2;
            ws.cell(1, 1).string("Username").style(style);
            ws.cell(1, 2).string("Loại tiền").style(style);
            ws.cell(1, 3).string("Loại giao dịch").style(style);
            ws.cell(1, 4).string("Số lượng").style(style);
            ws.cell(1, 5).string("Ngày tạo").style(style);
            ws.cell(1, 6).string("Địa chỉ ví").style(style);
            ws.cell(1, 7).string("TxID").style(style);
            ws.cell(1, 8).string("Nguồn").style(style);

            result.forEach(ele => {
                if (!ele.userdetail[0].username) { ele.userdetail[0].username = ''; }
                if (!ele.address) { ele.address = ''; }
                if (!ele.walletType) { ele.walletType = ''; }
                if (!ele.type) { ele.type = ''; }
                if (!ele.datecreate) { ele.datecreate = ''; }
                if (!ele.txid) { ele.txid = ''; }
                if (!ele.source) { ele.source = ''; }
                ws.cell(row, 1).string(ele.userdetail[0].username);
                ws.cell(row, 2).string(ele.walletType);
                ws.cell(row, 3).string(ele.type);
                ws.cell(row, 4).number(ele.amount);
                ws.cell(row, 5).string(moment(ele.datecreate).format('DD/MM/YYYY'));
                ws.cell(row, 6).string(ele.address);
                ws.cell(row, 7).string(ele.txid).style(style);

                ws.cell(row, 8).string(ele.source).style(style);
                row++;
            })
            wb.write('Lich su giao dich.xlsx', res);

        })
    })

})

router.get("/view-details/:id", function(req, res, next) {
    var _id = require('mongoose').Types.ObjectId(req.params.id);
    User.findOne({ _id: _id }, function(err, result) {
        result._doc.datecreate = moment(result._doc.datecreate).format('DD/MM/YYYY HH:mm:ss');
        if (result._doc.lockWithdraw == null) {
            result._doc.lockWithdraw = false;
            User.update({ username: result._doc.username }, { $set: { lockWithdraw: false } }, { upsert: true }, function(err, result) {
                if (err == null) {
                    res.render("admin/member/view-details", result._doc);
                }
            })
        } else {
            res.render("admin/member/view-details", result._doc);
        }

    })
})



router.get('/check-transfer-lending', function(req, res, next) {
    User.find({ username: 'linhpham1' }, function(err, listuser) {
        res.json(listuser);
        async.forEachOfSeries(listuser, function(value, key, callbackOut) {
            async.parallel({
                totalTransfer: function(callback) {
                    Commission.find({ idUser: value._id, type: 'transfer to usd' }, function(err, listTransfer) {
                        var sum = 0;
                        listTransfer.forEach(element => {
                            sum += element.amount;
                        });
                        callback(null, sum);
                    })
                },
                totalLending: function(callback) {
                    Commission.find({ idUser: value._id, type: 'lending' }, function(err, listLending) {
                        var sum = 0;
                        listLending.forEach(element => {
                            sum += element.amount;
                        });
                        callback(null, sum);
                    })
                }
            }, function(err, results) {
                console.log(value.username, results.totalTransfer, results.totalLending);
                console.log(' --- sum : ', results.totalTransfer + results.totalLending, '\n');
                callbackOut();
            });
        }, function(err) {

        })
    })
})

router.get('/*', function(req, res, next) {
    var data = {
        title: 'List member',
    }
    res.render("layout/admin", data);
})



module.exports = router