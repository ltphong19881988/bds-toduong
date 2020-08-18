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
        postType: 1
    };
    var post_content = {
        title: req.body.post.postContent.title,
        // oneLvlUrl: { type: String, unique: true },
        descriptions: req.body.post.postContent.descriptions,
        content: req.body.post.postContent.content,
        seoKeyWord: req.body.post.postContent.seoKeyWord,
        seoDescriptions: req.body.post.postContent.seoDescriptions,
    };

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




router.get('/*', function(req, res, next) {
    res.render("layout/admin");
})

module.exports = router