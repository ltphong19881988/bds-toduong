const router = require('express').Router();
const Category = require('../../models/category');
const ListProvince = require("../../models/listprovince");
const Project = require("../../models/project");
const ProductType = require("../../models/product-type");
const ProjectContent = require("../../models/project-content");
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
    console.log(req.body);
    var local = null;
    if (req.body.local) {
        local = await ListProvince.findOne({ link: req.body.local });
        console.log('local', local);
    }

    var options = {

    };
    if (local) {
        options['$or'] = [
            { 'province.link': local['link'] },
            { 'district.link': local['link'] },
            { 'ward.link': local['link'] },
        ]
    }
    console.log(options);

    var skip = 0;
    var limit = 10;
    if (req.body.skip && typeof req.body.skip === 'number' && (req.body.skip % 1) === 0) {
        skip = parseInt(req.body.skip);
    }
    if (req.body.limit && typeof req.body.limit === 'number' && (req.body.limit % 1) === 0) {
        limit = parseInt(req.body.limit);
    }
    Project.aggregate([{
            $match: options,
        },
        {
            $sort: { hot: -1, datecreate: -1 }
        },
        {
            $lookup: {
                from: "projectcontents",
                localField: "_id",
                foreignField: "idProject",
                as: "projectContent"
            },
        },
        { $unwind: "$projectContent" },
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
        res.json({ status: true, local, results: results[0].paginatedResults, totalCount, redirect: false });
    });

})

router.get('/name-key/:key', async(req, res, next) => {
    console.log(req.params);
    Project.aggregate([{
            $match: { nameKey: req.params.key },
        },
        {
            $lookup: {
                from: "projectcontents",
                localField: "_id",
                foreignField: "idProject",
                as: "projectContent"
            },
        },
        { $unwind: "$projectContent" },
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