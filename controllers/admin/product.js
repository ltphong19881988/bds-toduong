var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
// var request = require('request');
// var cheerio = require('cheerio');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var xl = require('excel4node');
var router = express.Router();
// const fileManager = require('file-manager-js');
var User = require('../../models/user');
var Category = require('../../models/category');
var CategoryType = require('../../models/category-type');
var Product = require('../../models/product');
var ProductType = require('../../models/product-type');
var ProductContent = require('../../models/product-content');
// var Role   = require('../models/role');
// var UserRole   = require('../models/userrole');
// var UserAuth   = require('../models/userauth');

var config = require('../../config'); // get our config file
// const { delete } = require('request');
// var Tool = require('../../helpers/tool');
var secretKey = config.secret;

var change_alias = function(alias) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    str = str.replace(/ + /g, " ");
    str = str.replace(/ /g, "-");
    str = str.trim();
    return str;
}

router.post('/all-product', function(req, res, next) {
    console.log(req.body);
    let options = {}
    if (req.body.idCategoryType) {
        options.idCategoryType = mongoose.Types.ObjectId(req.body.idCategoryType);
    }
    Product.aggregate([{
            $match: options,
        },
        {
            $sort: { datecreate: 1 }
        },
        {
            $lookup: {
                from: "categories",
                localField: "idCategory",
                foreignField: "_id",
                as: "category"
            },
        },
        // { $unwind: "$category" },
        {
            $lookup: {
                from: "productcontents",
                localField: "_id",
                foreignField: "idProduct",
                as: "productContent"
            },
        },
        { $unwind: "$productContent" },
        {
            $project: {
                "categoryName": '$category.name',
                "nameKey": 1,
                "normalPrice": 1,
                "pictures": 1,
                "salePrice": 1,
                "datecreate": 1,
                "title": '$productContent.title',
                "province": 1,
                "district": 1,
                "ward": 1,
            }
        },
    ], function(err, result) {
        // res.json(result);
        if (err) result = [];
        var records = {
            'draw': req.body.aoData[0].value,
            'recordsTotal': 2,
            'recordsFiltered': 0,
            'data': result
        };
        res.json(records);
    })
})

router.post("/item", async(req, res, next) => {
    console.log(req.body);
    if (!req.body.product.productContent.title) {
        return res.json({ status: false, mes: "Vui lòng nhập tiêu đề ( tên ) sản phẩm" })
    }
    if (!req.body.product.idCategory) {
        return res.json({ status: false, mes: "Vui lòng chọn danh mục sản phẩm" })
    }
    if (!req.body.product.normalPrice) {
        return res.json({ status: false, mes: "Vui lòng nhập giá thường " })
    }
    if (!req.body.product.acreage) {
        return res.json({ status: false, mes: "Vui lòng nhập diện tích " })
    }
    // if (!req.body.product.province) {
    //     return res.json({ status: false, mes: "Vui lòng nhập tỉnh thành" })
    // }
    // if (!req.body.product.district) {
    //     return res.json({ status: false, mes: "Vui lòng nhập quận huyện " })
    // }

    var product = {
        nameKey: '',
        idCategory: req.body.product.idCategory,
        idCategoryType: req.body.product.idCategoryType,
        normalPrice: req.body.product.normalPrice,
        salePrice: req.body.product.salePrice,
        pictures: req.body.product.pictures,
        tags: req.body.product.tags,
        acreage: req.body.product.acreage,
        alleyWidth: req.body.product.alleyWidth,
        direction: req.body.product.direction,
        province: req.body.product.province,
        district: req.body.product.district,
        ward: req.body.product.ward,
        productType: req.body.product.productType
    };
    var product_content = {
        title: req.body.product.productContent.title,
        // oneLvlUrl: { type: String, unique: true },
        descriptions: req.body.product.productContent.descriptions,
        content: req.body.product.productContent.content,
        seoKeyWord: req.body.product.productContent.seoKeyWord,
        seoDescriptions: req.body.product.productContent.seoDescriptions,
    };

    var result = await Product.AddProduct(product, product_content);
    res.json(result);

})

router.get("/item/:id", function(req, res, next) {
    var id = mongoose.Types.ObjectId(req.params.id);
    let options = {
        _id: id,
    }
    Product.aggregate([{
            $match: options,
        },
        {
            $lookup: {
                from: "categories",
                localField: "idCategory",
                foreignField: "_id",
                as: "category"
            },
        },
        // { $unwind: "$category" },
        {
            $lookup: {
                from: "productcontents",
                localField: "_id",
                foreignField: "idProduct",
                as: "productContent"
            },
        },
        { $unwind: "$productContent" },
    ], function(err, result) {
        // console.log('get product', result);
        if (result.length > 0)
            res.json(result[0]);
        else res.json(null);
    })
})

router.put("/item", async(req, res, next) => {
    let product = req.body.product;
    let productContent = product.productContent;
    delete product.category;
    delete product.productContent;
    var result = await Product.UpdateProduct(product, productContent);
    res.json(result);
})




router.get('/*', function(req, res, next) {
    res.render("layout/admin");
})

module.exports = router