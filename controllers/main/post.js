const router = require('express').Router();
const Category = require('../../models/category');
const ListProvince = require("../../models/listprovince");
const Post = require("../../models/post");
const PostContent = require("../../models/post-content");
const ProductType = require("../../models/product-type");
const Product = require("../../models/product");
const Tool = require("../../models/helpers/tool");
const mongoose = require('mongoose');
const { reject } = require('async');

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
var getPostCategoryFromUrl = async function(url, arr) {
    return new Promise((resolve) => {
        PostContent.aggregate([{
                $match: { oneLvlUrl: url },
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "idPost",
                    foreignField: "_id",
                    as: "post"
                },
            },
            { $unwind: "$post" },
            {
                $lookup: {
                    from: "categories",
                    localField: "post.idCategory",
                    foreignField: "_id",
                    as: "category"
                },
            },
            { $unwind: "$category" },
        ], function(err, result) {
            if (err || result.length == 0) resolve(null);
            resolve(result[0]);
        });
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


router.post('/filter-url', async(req, res, next) => {
    // console.log(req.body.url);
    if (!req.body.url || req.body.url == "") {
        return res.json({ status: false, mes: 'url invalid' });
    }

    var cateContent = await getPostCategoryFromUrl(req.body.url);
    if (!cateContent) return res.json({ status: false, mes: 'Không tìm thấy danh mục' });

    var skip = 0;
    var limit = 10;
    if (req.body.skip && typeof req.body.skip === 'number' && (req.body.skip % 1) === 0) {
        skip = parseInt(req.body.skip);
    }
    if (req.body.limit && typeof req.body.limit === 'number' && (req.body.limit % 1) === 0) {
        limit = parseInt(req.body.limit);
    }

    var listPost = new Promise((resolve, reject) => {
        Post.aggregate([{
                $match: {
                    idCategory: { $elemMatch: { $eq: cateContent.category._id } },
                    postType: 1,
                    visible: 1,
                },
            },
            {
                $sort: { datePost: -1 }
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
                    from: "postcontents",
                    localField: "_id",
                    foreignField: "idPost",
                    as: "postContent"
                },
            },
            { $unwind: "$postContent" },
            {
                $facet: {
                    paginatedResults: [{ $skip: skip }, { $limit: limit }],
                    totalCount: [{
                        $count: 'count'
                    }]
                }
            }
        ], function(err, results) {
            // res.json({ status: true, listPost: result, category: cateContent });
            resolve(results);
            // var totalCount = 0;
            // if (results[0].totalCount[0]) totalCount = results[0].totalCount[0].count;
            // res.json({ status: true, category: cateContent, listPost : results[0].paginatedResults, totalCount, redirect: false });
        });
    })
    
    var optionsPro = {visible : 1};
    var hotType = await ProductType.findOne({ groupType: "productType", value: "hot" });
    optionsPro['productType'] = { $elemMatch: { _id: hotType._id.toString() } };
    var count = await Product.countDocuments(optionsPro).exec();
    var skipRecords = Tool.getRandomArbitrary(0, count - 5);
    var hotProducts = new Promise(async(resolve, reject)=>{
        Product.aggregate([{
                $match: optionsPro,
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
            { "$skip": skipRecords },
            { "$limit": 5 },

        ], function(err, result) {
            if(err != null) reject(err)
            else  resolve(result);
        });
    });

    var newProducts = new Promise(async(resolve, reject)=>{
        Product.aggregate([{
                $match: {visible : 1},
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
            { "$skip": 0 },
            { "$limit": 5 },

        ], function(err, result) {
            if(err != null) reject(err)
            else  resolve(result);
        });
    });

    Promise.all([listPost, hotProducts, newProducts]).then((values)=> {
        var totalCount = 0;
        if (values[0][0].totalCount[0]) totalCount = values[0][0].totalCount[0].count;
        res.json({ status: true, category: cateContent, listPost : values[0][0].paginatedResults, totalCount, hotProducts: values[1], newProducts: values[2] , redirect: false });
    })

})

router.get('/name-key/:key', async(req, res, next) => {

    var postDetail = new Promise((resolve, reject) => {
        Post.aggregate([{
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
                    from: "postcontents",
                    localField: "_id",
                    foreignField: "idPost",
                    as: "postContent"
                },
            },
            { $unwind: "$postContent" },
        ], async function(err, post) {
            if(err != null) reject(err)
            else  resolve(post[0]);
        });
    })

    var relatedPosts = new Promise(async(resolve, reject) => {
        var limitrecords = 5;
        var count = await Post.countDocuments({ postType: 1, visible: 1 }).exec();
        var checklimit = count - limitrecords;
        if (checklimit < 0) checklimit = 0;
        var skipRecords = Tool.getRandomArbitrary(0, checklimit);
        Post.aggregate([{
                $match: { nameKey: { $ne: req.params.key }, postType: 1, visible: 1 },
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
                    from: "postcontents",
                    localField: "_id",
                    foreignField: "idPost",
                    as: "postContent"
                },
            },
            { $unwind: "$postContent" },
            { $skip: skipRecords },
            { $limit: 5 }
        ], async function(err, lienquans) {
            if(err != null) reject(err)
            else  resolve(lienquans);
        });
    })

    var options = {visible : 1};
    var hotType = await ProductType.findOne({ groupType: "productType", value: "hot" });
    // console.log(hotType);
    options['productType'] = { $elemMatch: { _id: hotType._id.toString() } };
    var count = await Product.countDocuments(options).exec();
    var skipRecords = Tool.getRandomArbitrary(0, count - 5);
    var hotProducts = new Promise(async(resolve, reject)=>{
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
            { "$skip": skipRecords },
            { "$limit": 5 },

        ], function(err, result) {
            if(err != null) reject(err)
            else  resolve(result);
        });
    })
    
    var newProducts = new Promise(async(resolve, reject)=>{
        Product.aggregate([{
                $match: {visible : 1},
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
            { "$skip": 0 },
            { "$limit": 5 },

        ], function(err, result) {
            if(err != null) reject(err)
            else  resolve(result);
        });
    });

    Promise.all([postDetail, relatedPosts, hotProducts, newProducts]).then(values => {
        res.json({ post: values[0], relatedPosts: values[1], hotProducts: values[2], newProducts : values[3] });
    })

})



module.exports = router