const router = require('express').Router();
const Category = require('../../models/category');
const ListProvince = require("../../models/listprovince");
const Product = require("../../models/product");
const ProductType = require("../../models/product-type");
const ProductContent = require("../../models/product-content");
const Post = require("../../models/post");
const PostContent = require("../../models/post-content");
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
    console.log(cateContent);
    if (!cateContent) return res.json({ status: false, mes: 'Không tìm thấy danh mục' });

    var skip = 0;
    var limit = 10;
    if (req.body.skip && typeof req.body.skip === 'number' && (req.body.skip % 1) === 0) {
        skip = parseInt(req.body.skip);
    }
    if (req.body.limit && typeof req.body.limit === 'number' && (req.body.limit % 1) === 0) {
        limit = parseInt(req.body.limit);
    }
    Post.aggregate([{
            $match: {
                idCategory: { $elemMatch: { $eq: cateContent.category._id } },
                postType: 1,
                visible: 1,
            },
        },
        {
            $sort: { datecreate: -1 }
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
    ], function(err, result) {
        res.json({ status: true, listPost: result, category: cateContent });
    });

})

router.get('/name-key/:key', async(req, res, next) => {
    // console.log(req.params);
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
        // {
        //     $project: {
        //         // "categoryName": '$category.name',
        //         "nameKey": 1,
        //         "normalPrice": 1,
        //         "pictures": 1,
        //         "salePrice": 1,
        //         "datecreate": 1,
        //         "title": '$postContent.title',
        //     }
        // },
    ], function(err, result) {
        console.log('result', result);
        res.json(result[0]);
    });
})



module.exports = router