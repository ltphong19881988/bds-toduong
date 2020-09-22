var express = require('express');
var mongoose = require('mongoose');
// var async = require('async');
// var fs = require('fs');
// var request = require('request');
// var cheerio = require('cheerio');
var moment = require('moment');
var router = express.Router();
// const fileManager = require('file-manager-js');
var User = require('../../models/user');
var Category = require('../../models/category');
var ProductType = require('../../models/product-type');

// var Role   = require('../models/role');
// var UserRole   = require('../models/userrole');
// var UserAuth   = require('../models/userauth');

var config = require('../../config'); // get our config file
// var Tool = require('../../helpers/tool');
var secretKey = config.secret;


router.post('/all', function(req, res, next) {
    console.log(req.body);
    ProductType.aggregate([
        // { $match: options },
        { $sort: { groupType: -1, priority: 1 } }
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

router.post('/filter-all', function(req, res, next) {
    // console.log(req.body);
    var options = {};
    if (req.body.groupType) {
        options['groupType'] = req.body.groupType;
    }
    ProductType.aggregate([
        { $match: options },
        { $sort: { groupType: -1, priority: 1 } }
    ]).exec(function(err, result) {
        res.json(result);
    });
})

router.post("/item", function(req, res, next) {
    // if (!req.body.groupType || req.body.groupType == "" || req.body.groupType == " ") {
    //     res.json({ status: false, mes: "Chưa nhập tiêu đề" });
    //     return;
    // }
    if (!req.body.groupType || !req.body.dataType || !req.body.value) return res.json({ status: false, mes: 'Vui lòng nhập đầy đủ groupType, dataType, value' });

    var item = new ProductType({
        groupType: req.body.groupType,
        dataType: req.body.dataType,
        name: req.body.name,
        priority: req.body.priority,
    });

    if (req.body.dataType == 'number') {
        item.value = parseInt(req.body.value);
    } else if (req.body.dataType == 'object') {
        item.value = JSON.parse(req.body.value);
        item.value = JSON.parse(item.value);
        console.log(typeof item.value);
    } else {
        item.value = req.body.value;
    }
    item.save(function(err, doc) {
        if (err) return res.json({ status: false, mes: 'Lỗi không lưu được, vui lòng thử lại sau' })
        return res.json({ status: true, mes: 'Thành công', doc })
    });

})

router.get("/item/:id", function(req, res, next) {
    var id = mongoose.Types.ObjectId(req.params.id);
    let options = {
        _id: id,
    }
    ProductType.aggregate([{
            $match: options,
        },
        // {
        //     $lookup: {
        //         from: "categories",
        //         localField: "idCategory",
        //         foreignField: "_id",
        //         as: "category"
        //     },
        // },
        // { $unwind: "$category" },
        // {
        //     $lookup: {
        //         from: "postcontents",
        //         localField: "_id",
        //         foreignField: "idPost",
        //         as: "postContent"
        //     },
        // },
        // { $unwind: "$postContent" },
    ], function(err, result) {
        if (result.length > 0)
            res.json(result[0]);
        else res.json(null);
    })
})

router.put("/item", async(req, res, next) => {
    console.log(req.body);
    if (!req.body.groupType || !req.body.dataType || !req.body.value) return res.json({ status: false, mes: 'Vui lòng nhập đầy đủ groupType, dataType, value' });

    var item = {
        groupType: req.body.groupType,
        dataType: req.body.dataType,
        name: req.body.name,
        priority: req.body.priority,
    };

    if (req.body.dataType == 'number') {
        item.value = parseInt(req.body.value);
    } else if (req.body.dataType == 'object') {
        item.value = JSON.parse(req.body.value);
        console.log(typeof item.value);
    } else {
        item.value = req.body.value;
    }
    console.log(item);
    var doc = await ProductType.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, item, { useFindAndModify: false, new: true });
    res.json({ status: true, mes: 'Thành công', doc });


})


router.get('/*', function(req, res, next) {
    res.render("layout/admin");
})

module.exports = router