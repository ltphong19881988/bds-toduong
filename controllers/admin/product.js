const express = require('express');
const mongoose = require('mongoose');
const { execSync } = require("child_process");
const os = require("os"); // Comes with node.js
console.log(os.type());
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
    // if (!req.body.product.normalPrice) {
    //     return res.json({ status: false, mes: "Vui lòng nhập giá thường " })
    // }
    // if (!req.body.product.acreage) {
    //     return res.json({ status: false, mes: "Vui lòng nhập diện tích " })
    // }
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
        seoSocial: req.body.product.productContent.seoSocial
    };

    if (!product_content.seoSocial) product_content.seoSocial = {};

    if (!product_content.seoSocial['type'] || product_content.seoSocial['type'] == '')
        product_content.seoSocial['type'] = 'article';
    if (!product_content.seoSocial['title'] || product_content.seoSocial['title'] == '')
        product_content.seoSocial['title'] = product_content.title;
    if (!product_content.seoSocial['description'] || product_content.seoSocial['description'] == '')
        product_content.seoSocial['description'] = product_content.seoDescriptions;
    // if (!product_content.seoSocial['pictures'] || product_content.seoSocial['pictures'].length == 0)
    //     product_content.seoSocial['pictures'] = product.pictures;

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

router.delete("/item/:id", async(req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log(config.publicPath);
        var pathDelete = config.publicPath + '/public/uploads/media/autoupload';
        console.log(pathDelete);
        const opts = { session, new: false };
        var p = await Product.findOneAndDelete({ _id: id }, opts);
        var c = await ProductContent.findOneAndDelete({ idProduct: id }, opts);
        // delete folder image 
        var cm = "cd " + pathDelete + " && rmdir /Q /S " + req.params.id.toString();
        if (os.type().toLowerCase().indexOf("linux") != -1) {

        }
        const stdout = execSync(cm);

        console.log(stdout.toString()); // stdout of the command if

        await session.commitTransaction();
        session.endSession();
        res.json({ status: true, mes: 'Xóa sản phẩm thành công', product: p, productContent: c });
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        res.json({ status: false, mes: error.message });
        throw error; // Rethrow so calling function sees error
    }
})

router.post("/update-field", async(req, res, next) => {
    console.log('update-field ', req.body);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const opts = { session, new: true };
        var id = mongoose.Types.ObjectId(req.body.id);
        await Product.findOneAndUpdate({ _id: id }, req.body.update, opts);
        await ProductContent.findOneAndUpdate({ idProduct: id }, { 'seoSocial.pictures': req.body.seoPic }, opts);
        // res.json({ status: false, mes: err });
        res.json({ status: true, mes: "OK" });

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'OK' };
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }


})


router.get('/*', function(req, res, next) {
    res.render("layout/admin");
})

module.exports = router