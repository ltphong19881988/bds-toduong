// get an instance of mongoose and mongoose.Schema
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('./../config'); // get our config file
var mongoose = require('mongoose');
const Post = require('./post');
const PostContent = require('./post-content');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var OneLvlUrlSchema = new Schema({
    idCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    local: {},
    languageCode: { type: String, default: 'vn' },
    title: { type: String },
    oneLvlUrl: { type: String, unique: true },
    descriptions: String,
    content: String,
    seoKeyWord: String,
    seoDescriptions: String,
});
var OneLvlUrl = mongoose.model('OneLvlUrl', OneLvlUrlSchema);
module.exports = OneLvlUrl;


var filterCategoryFromName = async function(name) {
    return PostContent.aggregate([
            { $match: { title: { $regex: name, $options: 'iu' } } },
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
                $match: { 'post.postType': 0 }
            }
        ]).exec()
        .then(result => {
            return new Promise(resolve => {
                Promise.all(result.map(async function(item) {
                    return mongoose.Types.ObjectId(item.post.idCategory.toString());
                })).then(abc => {
                    resolve(abc);
                });
            });
        })
        .catch(err => {
            console.log('err', err);
        });

}

module.exports.FilterAllDataTable = async function(data) {
    console.log('aoData', data);
    var options = {};
    var oneLvlUrl = data[1].value.filter(item => item.data == 'oneLvlUrl')[0];
    if (oneLvlUrl && oneLvlUrl.search.value) {
        options['oneLvlUrl'] = { $regex: oneLvlUrl.search.value, $options: 'ui' };
    }
    var categoryName = data[1].value.filter(item => item.data == 'category.name')[0];
    if (categoryName && categoryName.search.value) {
        var listCate = await filterCategoryFromName(categoryName.search.value);
        // console.log('listCate', listCate);
        options['idCategory'] = { $in: listCate };
    }
    var localTitle = data[1].value.filter(item => item.data == 'local.title')[0];
    if (localTitle && localTitle.search.value) {
        var listCate = await filterCategoryFromName(categoryName.search.value);
        // console.log('listCate', listCate);
        options['idCategory'] = { $in: listCate };
    }
    // console.log('options', options);
    return OneLvlUrl.aggregate([
        { $match: options },
        {
            $lookup: {
                from: "categories",
                localField: "idCategory",
                foreignField: "_id",
                as: "category"
            },
        },
        {
            $unwind: {
                path: "$category",
                "preserveNullAndEmptyArrays": true
            }
        },
        { $sort: { oneLvlUrl: 1 } }
    ], function(err, result) {
        console.log(err, result);
        if (err) result = [];
        return (result);
    });

}