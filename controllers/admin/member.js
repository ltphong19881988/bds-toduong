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
const Role = require('../../models/role');
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

router.post('/all-mods', async(req, res, next) => {
    var abc = await User.getAllMember('admin', req.body.aoData);
    res.json(abc);
})

router.post('/all-user-invest', async(req, res, next) => {
    // console.log(req.body);
    var abc = await UserInvest.filterAllUserInvest(req.body);
    res.json(abc);
})

router.get('/user-invest-details/:id', async(req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    var item = await UserInvest.getUserInvestDetails(id);
    res.json(item);
})

router.post('/approve-user-invest/:id', async(req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    var abc = await UserInvest.ApproveUserInvest(id);
    // Run sale
    // console.log('da xong');
    res.json(abc);
})

router.post('/update-user-invest/:id', async(req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    // if (req.body.update.status == true) {
    //     console.log('day');
    //     var abc = await UserInvest.ApproveUserInvest(id);
    //     // Run sale
    //     var item = await UserInvest.getUserInvestDetails(id);
    //     await UserSales.RunUserSalesFromInvest(item);
    //     res.json(abc);
    // } else {

    // }
    var item = await UserInvest.findOneAndUpdate({ _id: id }, req.body.update, { new: true }).exec();
    // console.log(item);
    res.json(item);
    // var item = await UserInvest.getUserInvestDetails(id);

})

router.put('/update-invest-contract/:id', async(req, res, next) => {
    // console.log(req.body);
    var userinvest = await UserInvest.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
    userinvest.contract.id = req.body.contract.id;
    userinvest.contract.loainongsan = [];
    req.body.contract.loainongsan.forEach(element => {
        console.log(element);
        if (element) userinvest.contract.loainongsan.push(element);
    });
    // console.log('mot', userinvest.contract.images);
    await MyFunction.verifyFolderUpload(__basedir + '/public/uploads/contractImages/', userinvest._id);
    if (req.body.images) {
        var promises = req.body.images.map(function(val) {
            var base64Data = val.data.replace(/^data:image\/png;base64,/, "").replace(/^data:image\/jpeg;base64,/, "");
            var abc = '/uploads/contractImages/' + userinvest._id + '/' + val.name;
            var imageName = __basedir + '/public/uploads/contractImages/' + userinvest._id + '/' + val.name;
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
            userinvest.contract.images = data;
        }).catch(function(err) {
            // error here 
            console.log(err);
            return res.json({ status: false, mes: 'Upload ảnh thất bại' });
        });
    }
    var item = await UserInvest.findOneAndUpdate({ _id: userinvest._id }, { contract: userinvest.contract }, { new: true });
    res.json({ status: true, mes: 'Thay đổi thành công', item });
    // console.log('hai', userinvest.contract.images);
})


router.get('/all-member-index-to-excel', function(req, res, next) {
    var wb = new xl.Workbook();
    // Add Worksheets to the workbook
    var ws = wb.addWorksheet('Danh sách thành viên VNC');
    // var ws2 = wb.addWorksheet('Sheet 2');
    // Create a reusable style
    var style = wb.createStyle({
        font: {
            color: '#1b418b',
            size: 12
        },
        //numberFormat: '$#,##0.00; ($#,##0.00); -'
    });

    var option = {};
    async.forEachOf(req.body, function(value, key) {
        if (key != 'cur_page' && key != 'skip' && key != 'limit') {
            if (key != null && key != '')
                option[key] = { $regex: value };
        }
    })

    User.aggregate([{
            $match: option,
        },
        {
            $sort: { datecreate: 1 }
        },
        {
            $lookup: {
                from: "commissions",
                localField: "_id",
                foreignField: "idUser",
                as: "usertrans"
            },
        },
        {
            $project: {
                "usertrans": {
                    "$filter": {
                        "input": "$usertrans",
                        "as": "trans",
                        "cond": { $or: [{ $eq: ["$$trans.type", 'lending'] }] }
                    }
                },
                "username": 1,
                "email": 1,
                "phone": 1,
                "sponsor": 1,
                "datecreate": 1,
                "lock": 1,
                "lockWidthdraw": 1,

            }
        },
        {
            $project: {
                "username": 1,
                "email": 1,
                "phone": 1,
                "sponsor": 1,
                "datecreate": 1,
                "lock": 1,
                "lockWidthdraw": 1,
                'count': { $size: "$usertrans" },
                'sum': { $sum: '$usertrans.amount' }
            }
        },
    ], function(err, result) {
        var row = 2;
        ws.cell(1, 1).string("Username").style(style);
        ws.cell(1, 2).string("Email").style(style);
        ws.cell(1, 3).string("Điện thoại").style(style);
        ws.cell(1, 4).string("Ngày tạo").style(style);
        ws.cell(1, 5).string("Người giới thiệu").style(style);
        ws.cell(1, 6).string("Khóa đăng nhập").style(style);
        ws.cell(1, 7).string("Khóa rút tiền").style(style);
        ws.cell(1, 8).string("Số gói lending").style(style);
        ws.cell(1, 9).string("Tổng tiền lending").style(style);
        result.forEach(ele => {
            //console.log(ele.datecreate);
            if (!ele.username) { ele.username = ''; }
            if (!ele.email) { ele.email = ''; }
            if (!ele.phone) { ele.phone = ''; }
            if (!ele.datecreate) { ele.datecreate = ''; }
            if (!ele.sponsor) { ele.sponsor = ''; }
            if (!ele.lock) { ele.lock = false; }
            if (!ele.lockWithdraw) { ele.lockWithdraw = false; }
            ws.cell(row, 1).string(ele.username);
            ws.cell(row, 2).string(ele.email);
            ws.cell(row, 3).string(ele.phone);
            ws.cell(row, 4).string(moment(ele.datecreate).format('DD/MM/YYYY'));
            ws.cell(row, 5).string(ele.sponsor);
            ws.cell(row, 6).bool(ele.lock);
            ws.cell(row, 7).bool(ele.lockWithdraw);
            ws.cell(row, 8).number(ele.count).style(style);
            ws.cell(row, 9).number((0 - ele.sum)).style(style);
            row++;
        })
        wb.write('Danh sach thanh vien VNC.xlsx', res);
    })

    // User.find(option, null, {sort : {datecreate : 1}},  function(err, result){

    // }).select({ "username": 1, "_id": 0, "email" : 1, "phone" : 1, "datecreate" : 1, "sponsor" : 1, "lock" : 1, "lockWithdraw" : 1});

    // // Set value of cell A1 to 100 as a number type styled with paramaters of style
    // ws.cell(1,1).number(100).style(style);

    // // Set value of cell B1 to 300 as a number type styled with paramaters of style
    // ws.cell(1,2).number(200).style(style);

    // // Set value of cell C1 to a formula styled with paramaters of style
    // ws.cell(1,3).formula('A1 + B1').style(style);

    // // Set value of cell A2 to 'string' styled with paramaters of style
    // ws.cell(2,1).string('string').style(style);

    // // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
    // ws.cell(3,1).bool(true).style(style).style({font: {size: 14}});

    //wb.write('Excel.xlsx', res);
})


// // //  View Edit DELETE
router.get("/all-roles", async(req, res, next) => {
    res.json(await Role.find({}).sort({ priority: 1 }));
})

router.get("/user-info/:id", function(req, res, next) {
    var _id = require('mongoose').Types.ObjectId(req.params.id);
    User.findOne({ _id: _id }, function(err, result) {
        res.json(result);

    })
})

router.put("/user-info/:id", function(req, res, next) {
    var id = require('mongoose').Types.ObjectId(req.params.id);
    User.findOneAndUpdate({ _id: id }, { roles: req.body.roles }, { new: true }).exec(function(err, result) {
        if (err) return res.json({ status: false, mes: "Không cập nhật được" });
        return res.json({ status: true, mes: "cập nhật thành công", user: result });
    })
})

router.post('/edit-member', function(req, res, next) {
    // console.log(req.body);
    var _id = require('mongoose').Types.ObjectId(req.body.key);
    User.findOne({ _id: _id }, function(err, result) {
        // console.log(result);
        if (result == null) {
            res.json({ status: false, mes: "Không tìm thấy id" });
        } else {
            var setFields = { lock: req.body.lock, lockWithdraw: req.body.lockWithdraw, phone: req.body.phone };
            if (req.body.resetPassword == "on") {
                setFields.password = passwordHasher.hashPassword('vnc123456');
            }
            User.update({ _id: _id }, { $set: setFields }, { upsert: true }, function(err, result) {
                if (err == null) {
                    res.json({ status: true, mes: "Thay đổi thông tin thành công" });
                } else {
                    res.json({ status: false, mes: "Không cập nhật được thông tin" });
                }

            })
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

router.get('/tree', function(req, res, next) {
    var data = {
        title: 'admin all user',
    }
    res.render("admin/member/tree", data);
})

router.get('/list-user', function(req, res, next) {
    var data = {
        title: 'admin all user',
    }
    res.render("admin/member/list-user", data);
})

router.get('/get-all-user', function(req, res, next) {
    var skip = 0;
    var limit = 10;
    if (req.query.page != null && parseInt(req.query.page) > 1) {
        skip = (parseInt(req.query.page) - 1) * 10;
    }
    var query = User.find({});
    if (req.query.username != null && req.query.username != '') {
        query = query.where('username', { $regex: req.query.username });
    }
    query = query.sort({ datecreate: 1 }).skip(skip).limit(limit);
    query.exec(function(err, listuser) {
        async.forEachOfSeries(listuser, function(value, key, callbackOut) {
            async.parallel({
                btcTrans: function(callback) {
                    var kq = 0;
                    var abc = Transaction.find({ idUser: value._id, walletType: 'btc' }).sort({ datecreate: 1 });
                    abc.exec(function(err, listTran) {
                        listTran.forEach(element => {
                            kq += element.amount;
                        });
                        callback(null, kq);
                    })
                },
                ethTrans: function(callback) {
                    var kq = 0;
                    var abc = Transaction.find({ idUser: value._id, walletType: 'eth' }).sort({ datecreate: 1 });
                    abc.exec(function(err, listTran) {
                        listTran.forEach(element => {
                            kq += element.amount;
                        });
                        callback(null, kq);
                    })
                },
                vncTrans: function(callback) {
                    var kq = 0;
                    var abc = Transaction.find({ idUser: value._id, walletType: 'vnc' }).sort({ datecreate: 1 });
                    abc.exec(function(err, listTran) {
                        if (listTran != null) {
                            listTran.forEach(element => {
                                kq += element.amount;
                            });
                        }

                        callback(null, kq);
                    })
                },
                // usdBalance: function (callback) {
                //     var usdBalance = 0;
                //     Commission.find({ idUser: value._id, $or: [{ type: 'lending' }] }, function (err, result) {
                //         result.forEach(element => {
                //             usdBalance += element.amount;
                //         });
                //         callback(null, usdBalance);
                //     })
                // },
                // usdDaily: function (callback) {
                //     var usdBalance = 0;
                //     var curday = new Date(moment().add(1, 'd').format('YYYY-MM-DD'));
                //     var abc = ['daily bonus', 'daily withdraw'];
                //     Commission.find({ idUser: value._id, type: { $in: abc }, datecreate: { $lte: curday } }, function (err, result) {
                //         result.forEach(element => {
                //             usdBalance += element.amount;
                //         });
                //         callback(null, usdBalance);
                //     })
                // },
                // usdCommission: function (callback) {
                //     var usdBalance = 0;
                //     var curday = new Date(moment().add(1, 'd').format('YYYY-MM-DD'));
                //     var abc = ["sponsor bonus", "pay back", "team point bonus", "commission withdraw", "receive"];
                //     Commission.find({ $and: [{ idUser: value._id }, { datecreate: { $lte: curday } }, { type: { $in: abc } }] }, function (err, result) {
                //         result.forEach(element => {
                //             usdBalance += element.amount;
                //         });
                //         callback(null, usdBalance);
                //     })
                // },

            }, function(err, results) {
                listuser[key]._doc.btcTrans = -results.btcTrans.toFixed(2);
                listuser[key]._doc.ethTrans = results.ethTrans.toFixed(2);
                listuser[key]._doc.vncTrans = results.vncTrans.toFixed(2);
                callbackOut();
            })
        }, function(err) {
            res.json(listuser);
        })
    });
    // User.find({}).where('username', { $regex : 'p'}).sort({datecreate : 1}).skip(skip).limit(limit).exec(function(err, listuser){
    //     res.json(listuser);
    // });
})

router.get('/lending', function(req, res, next) {

})

router.get('/lock', function(req, res, next) {
    var username = req.query.username;
    var value = req.query.value;
    User.update({ username: username }, { $set: { lock: value } }, { upsert: true }, function(err, result) {
        console.log(err, result);
        res.json(result);
    })
})

router.get('/count-all-user', function(req, res, next) {
    var query = User.countDocuments({});
    if (req.query.username != null && req.query.username != '') {
        query = query.where('username', { $regex: req.query.username });
    }
    query.exec(function(err, result) {
        res.json(result);
    })
})

router.get('/*', function(req, res, next) {
    var data = {
        title: 'List member',
    }
    res.render("layout/admin", data);
})




module.exports = router