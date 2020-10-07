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


router.post('/all-product', async function(req, res, next) {
    // console.log(req.body.aoData);
    var result = await Product.FilterDataTableProduct(req.body.aoData);
    var records = {
        'draw': req.body.aoData[0].value,
        'recordsTotal': 2,
        'recordsFiltered': 0,
        'data': result
    };
    res.json(records);
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

    if(!req.productContent.seoSocial){
        product_content["seoSocial"] = {
            type : "article",
            title : product_content.title,
            description : product_content.seoDescriptions,
            image : product.pictures[0]
        };
    }

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