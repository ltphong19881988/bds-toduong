var express = require('express');
var mongoose = require('mongoose');
const { execSync } = require("child_process");
var fs = require('fs');
const os = require("os"); // Comes with node.js
// var cheerio = require('cheerio');
var moment = require('moment');
var router = express.Router();
// const fileManager = require('file-manager-js');
var User = require('../../models/user');
var Category = require('../../models/category');
var CategoryType = require('../../models/category-type');
var Post = require('../../models/post');
var ProductType = require('../../models/product-type');
var PostContent = require('../../models/post-content');
// var Role   = require('../models/role');
// var UserRole   = require('../models/userrole');
// var UserAuth   = require('../models/userauth');

var config = require('../../config'); // get our config file
// const { delete } = require('request');
// var Tool = require('../../helpers/tool');
var secretKey = config.secret;

router.post('/all-post', async function(req, res, next) {
    // console.log(req.body.aoData);
    var result = await Post.FilterDataTablePost(req.body.aoData);
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
    if (!req.body.post.postContent.title) {
        return res.json({ status: false, mes: "Vui lòng nhập tiêu đề ( tên ) sản phẩm" })
    }
    if (!req.body.post.idCategory) {
        return res.json({ status: false, mes: "Vui lòng chọn danh mục sản phẩm" })
    }

    var post = {
        nameKey: '',
        idCategory: req.body.post.idCategory,
        idCategoryType: req.body.post.idCategoryType,
        pictures: req.body.post.pictures,
        tags: req.body.post.tags,
        postType: 1,
        datePost: req.body.post.datePost
    };
    var post_content = {
        title: req.body.post.postContent.title,
        // oneLvlUrl: { type: String, unique: true },
        descriptions: req.body.post.postContent.descriptions,
        content: req.body.post.postContent.content,
        seoKeyWord: req.body.post.postContent.seoKeyWord,
        seoDescriptions: req.body.post.postContent.seoDescriptions,
    };

    if (!post_content.seoSocial) post_content.seoSocial = {};

    if (!post_content.seoSocial['type'] || post_content.seoSocial['type'] == '')
        post_content.seoSocial['type'] = 'article';
    if (!post_content.seoSocial['title'] || post_content.seoSocial['title'] == '')
        post_content.seoSocial['title'] = post_content.title;
    if (!post_content.seoSocial['description'] || post_content.seoSocial['description'] == '')
        post_content.seoSocial['description'] = post_content.seoDescriptions;
    // if(!post_content.seoSocial['pictures'] || post_content.seoSocial['pictures'].length == 0)
    //     post_content.seoSocial['pictures'] = post.pictures;

    var result = await Post.AddPost(post, post_content);
    res.json(result);

})

router.get("/item/:id", function(req, res, next) {
    var id = mongoose.Types.ObjectId(req.params.id);
    let options = {
        _id: id,
    }
    Post.aggregate([{
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
                from: "postcontents",
                localField: "_id",
                foreignField: "idPost",
                as: "postContent"
            },
        },
        { $unwind: "$postContent" },
    ], function(err, result) {
        // console.log('get post', result);
        if (result.length > 0)
            res.json(result[0]);
        else res.json(null);
    })
})

router.put("/item", async(req, res, next) => {
    let post = req.body.post;
    let postContent = post.postContent;
    delete post.category;
    delete post.postContent;
    var result = await Post.UpdatePost(post, postContent);
    res.json(result);
})

router.delete("/item/:id", async(req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params.id);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log(config.publicPath);
        var pathDelete = config.publicPath + '/public/uploads/media/autoupload-post/';
        console.log(pathDelete);
        const opts = { session, new: false };
        var p = await Post.findOneAndDelete({ _id: id }, opts);
        var c = await PostContent.findOneAndDelete({ idPost: id }, opts);
        // delete folder image 
        var cm = "cd " + pathDelete + " && rmdir /Q /S " + req.params.id.toString();
        if (os.type().toLowerCase().indexOf("linux") != -1) {
            cm = "cd " + pathDelete + " && rm -rf " + req.params.id.toString();
        }
        const stdout = execSync(cm);

        console.log(stdout.toString()); // stdout of the command if

        await session.commitTransaction();
        session.endSession();
        res.json({ status: true, mes: 'Xóa bài viết thành công', post: p, posttContent: c });
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
        await Post.findOneAndUpdate({ _id: id }, req.body.update, opts);
        await PostContent.findOneAndUpdate({ idPost: id }, { 'seoSocial.pictures': req.body.seoPic }, opts);
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