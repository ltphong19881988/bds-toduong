const router = require('express').Router();
const Category = require('../../models/category');
const ListProvince = require("../../models/listprovince");
const Product = require("../../models/product");
const ProductType = require("../../models/product-type");
const ProductContent = require("../../models/product-content");
const Post = require("../../models/post");
const PostContent = require("../../models/post-content");
const Tool = require("../../models/helpers/tool");
const mongoose = require('mongoose');

var strIndexOf = function(url, str) {
    return url.indexOf(str);
}
var getCategoryOfPost = async function(idPost) {
    return new Promise(async(resole, reject) => {
        var post = await Post.findOne({ _id: idPost });
        var cate = await Category.findOne({ _id: post.idCategory });
        resole(cate);
    });
}
var getMaxUrlContent = async function(url, arr) {
    return new Promise((resolve) => {
        var kq = null;
        for (var i = 0; i <= arr.length; i++) {
            if (i == arr.length) resolve(kq);
            else {
                if (url.indexOf(arr[i].oneLvlUrl) > -1) {
                    if (kq == null) kq = arr[i];
                    else if (kq.oneLvlUrl.length < arr[i].oneLvlUrl.length) kq = arr[i];
                }
            }
        }
    })
}

var getAllCategory = function(options, callback) {
    Category.aggregate([{
            $match: options,
        },
        {
            $sort: { idCategoryType: 1, idParent: 1, priority: 1 }
        },
        {
            $lookup: {
                from: "categorytypes",
                localField: "idCategoryType",
                foreignField: "_id",
                as: "categoryType"
            },
        },
        { $unwind: "$categoryType" },
        {
            $project: {
                "categoryType": 1,
                "_id": 1,
                "name": 1,
                "priority": 1,
                "idParent": 1,
                "datecreate": 1,
            }
        },

    ], function(err, result) {
        callback(result);
    })
}

router.get('/category/all-category', async(req, res, next) => {
    var options = {};
    // console.log(req.query);
    if (req.query.idParent) {
        if (req.query.idParent != 'null')
            options.idParent = mongoose.Types.ObjectId(req.query.idParent);
        else
            options.idParent = null;
    }
    if (req.query.idCategoryType) {
        options.idCategoryType = mongoose.Types.ObjectId(req.query.idCategoryType);
    }
    getAllCategory(options, function(results) {
        res.json(results);
    });
})

router.post('/search-form', async(req, res, next) => {
    console.log(req.body.searchForm);
    var local = null;
    if (!req.body.searchForm.idCategory) return res.json({ status: false, mes: "Vui lòng chọn loại bất động sản" });
    // if (!req.body.searchForm.province && !req.body.searchForm.province && !req.body.searchForm.province) return res.json({ status: false, mes: "Vui lòng chọn loại bất động sản" });
    if (req.body.searchForm.province) local = req.body.searchForm.province;
    if (req.body.searchForm.district) local = req.body.searchForm.district;
    if (req.body.searchForm.ward) local = req.body.searchForm.ward;
    var idCategory = mongoose.Types.ObjectId(req.body.searchForm.idCategory);
    // var cate = await Category.findOne({_id : idCategory});
    var postCate = await Post.findOne({ idCategory: idCategory, postType: 0 });
    console.log(postCate);
    var postCateContent = await PostContent.findOne({ idPost: postCate._id, languageCode: 'vn' });
    var urlRedirect = postCateContent.oneLvlUrl;
    if (local != null) {
        urlRedirect = urlRedirect + '-' + local.link;
    }
    res.json({ status: true, mes: 'OK', urlRedirect });
})

router.post('/product-type/filter-all', async(req, res, next) => {
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

var GetNewProduct = async function(req, res, next) {
    var options = {};
    var skip = 0;
    var limit = 10;
    if (req.body.skip && typeof req.body.skip === 'number' && (req.body.skip % 1) === 0) {
        skip = parseInt(req.body.skip);
    }
    if (req.body.limit && typeof req.body.limit === 'number' && (req.body.limit % 1) === 0) {
        limit = parseInt(req.body.limit);
    }
    var exUrl = req.body.url.split('san-pham-moi')[1];
    if (exUrl.length > 2) {
        exUrl = exUrl.replace('-', '');
    }
    var local = await ListProvince.findOne({ link: exUrl });
    if (local) {
        options['$or'] = [
            { 'province.link': local['link'] },
            { 'district.link': local['link'] },
            { 'ward.link': local['link'] },
        ]
    }
    Product.aggregate([{
            $match: options,
        },
        {
            $sort: { datecreate: -1 }
        },
        {
            $lookup: {
                from: "productcontents",
                localField: "_id",
                foreignField: "idProduct",
                as: "productContent"
            },
        },
        { $unwind: "$productContent" },
        { "$skip": skip },
        { "$limit": skip + limit },

    ], function(err, result) {
        res.json(result);
    });
}

router.post('/filter-url', async(req, res, next) => {
    // console.log(req.body);
    if (req.body.url.indexOf('san-pham-moi') == 0) {
        return GetNewProduct(req, res, next);
    }
    if (req.body.extOpts) {

    }
    var abc = await PostContent.find().exec();
    var cateContent = await getMaxUrlContent(req.body.url, abc);
    var exUrl = req.body.url.split(cateContent.oneLvlUrl)[1];
    if (exUrl.length > 2) {
        exUrl = exUrl.replace('-', '');
    }
    var post = await Post.findOne({ _id: cateContent.idPost });
    var cate = await Category.findOne({ _id: post.idCategory });
    var local = await ListProvince.findOne({ link: exUrl });
    // console.log('local', local);
    if (exUrl.length > 2 && local == null) return res.json({ cateContent, cate, redirect: true });

    var options = {
        idCategory: { $elemMatch: { $eq: cate._id } },
        visible : 1,
    };
    if (local) {
        options['$or'] = [
            { 'province.link': local['link'] },
            { 'district.link': local['link'] },
            { 'ward.link': local['link'] },
        ]
    }
    // console.log(options);

    var skip = 0;
    var limit = 10;
    if (req.body.skip && typeof req.body.skip === 'number' && (req.body.skip % 1) === 0) {
        skip = parseInt(req.body.skip);
    }
    if (req.body.limit && typeof req.body.limit === 'number' && (req.body.limit % 1) === 0) {
        limit = parseInt(req.body.limit);
    }
    Product.aggregate([{
            $match: options,
        },
        {
            $sort: { productType: -1, datecreate: -1 }
        },
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
            $facet: {
                paginatedResults: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{
                    $count: 'count'
                }]
            }
        }
    ], function(err, results) {
        // console.log('result', result);
        var totalCount = 0;
        if (results[0].totalCount[0]) totalCount = results[0].totalCount[0].count;
        res.json({ cateContent, cate, local, results: results[0].paginatedResults, totalCount, redirect: false });
    });

})

router.post('/filter-product', async(req, res, next) => {
    // console.log(req.body);
    var options = {visible : 1};
    var skip = 0;
    var limit = 10;
    if (req.body.filter.idCategory) {
        options['idCategory'] = { $elemMatch: { $eq: mongoose.Types.ObjectId(req.body.filter.idCategory) } }
    }
    if (req.body.filter.productType) {
        var proType = await ProductType.findOne({ groupType: "productType", value: req.body.filter.productType });
        options['productType'] = { $elemMatch: { _id: proType._id.toString() } };
    }
    if(req.body.filter.district){
        options["$or"] = [
            { 'district.link': req.body.filter.district['link'] },
        ]
    }
    if (req.body.filter.skip && typeof req.body.filter.skip === 'number' && (req.body.filter.skip % 1) === 0) {
        skip = parseInt(req.body.filter.skip);
    }
    if (req.body.filter.limit && typeof req.body.filter.limit === 'number' && (req.body.filter.limit % 1) === 0) {
        limit = parseInt(req.body.filter.limit);
    }
    
    Product.aggregate([{
            $match: options,
        },
        {
            $sort: { datecreate: -1 }
        },
        // {
        //     $lookup: {
        //         from: "categories",
        //         localField: "idCategory",
        //         foreignField: "_id",
        //         as: "category"
        //     },
        // },
        {
            $lookup: {
                from: "productcontents",
                localField: "_id",
                foreignField: "idProduct",
                as: "productContent"
            },
        },
        { $unwind: "$productContent" },
        { "$skip": skip },
        { "$limit": skip + limit },

    ], function(err, result) {
        res.json(result);
    });

})

router.get('/name-key/:key', async(req, res, next) => {
    // console.log(req.params);
    Product.aggregate([{
            $match: { nameKey: req.params.key },
        },
        {
            $lookup: {
                from: "categories",
                localField: "idCategory",
                foreignField: "_id",
                as: "category"
            },
        },
        {
            $lookup: {
                from: "productcontents",
                localField: "_id",
                foreignField: "idProduct",
                as: "productContent"
            },
        },
        { $unwind: "$productContent" },
    ], async function(err, products) {
        // console.log('result', products);
        var mt = await PostContent.findOne({oneLvlUrl : 'ban-nha-mat-tien'});
        // console.log('mt', mt);
        var mattien = await Post.findOne({_id : mt.idPost});
        // console.log('mattien', mattien);
        var countMTOpt = {'idCategory' : { $elemMatch: { $eq: mongoose.Types.ObjectId(mattien.idCategory[0]) } } };

        var th = await PostContent.findOne({oneLvlUrl : 'ban-nha-trong-hem'});
        var tronghem = await Post.findOne({_id : th.idPost});
        // console.log('tronghem', tronghem);
        var countTHOpt = {'idCategory' : { $elemMatch: { $eq: mongoose.Types.ObjectId(tronghem.idCategory[0]) } } };

        var orOpt = [
            { 'province.link': products[0].province['link'] },
        ] ;
        if(products[0].district){
            orOpt.push({ 'district.link': products[0].district['link'] });
        }
        if(products[0].ward){
            orOpt.push({ 'ward.link': products[0].ward['link'] });
            countMTOpt['$or'] = [
                { 'district.link': products[0].district['link'] }
            ];
            countTHOpt['$or'] = [
                { 'district.link': products[0].district['link'] }
            ]
        }
        var limitrecords = 5;
        var relateOpts = {
            nameKey: { $ne: req.params.key },
            visible: 1,
            idCategory: { $elemMatch: { $eq: products[0].category[1]._id } },
            $or: orOpt
        };
        // var count = await Product.countDocuments(relateOpts).exec();
        // var checklimit = count - limitrecords;
        // if (checklimit < 0) checklimit = 0;
        // var skipRecords = Tool.getRandomArbitrary(0, checklimit);
        // console.log(countMTOpt);
        

        Product.aggregate([{
                $match: relateOpts,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "idCategory",
                    foreignField: "_id",
                    as: "category"
                },
            },
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
                $sort: { "ward.ID": -1, 'district.ID': -1, 'province.ID': -1 }
            },
            { $skip: 0 },
            { $limit: 5 }
        ], async function(err, relatedProducts) {
            // console.log('relatedProducts', relatedProducts);
            var countMT = await Product.countDocuments(countMTOpt).exec();
            var countTH = await Product.countDocuments(countTHOpt).exec();
            res.json({ product: products[0], relatedProducts: relatedProducts, countMT, countTH });
        });

    });
})



module.exports = router