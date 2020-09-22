// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var async = require('async');
const Tool = require('./helpers/tool');
const PostContent = require('./post-content');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var Post = new Schema({
    nameKey: { type: String },
    idCategory: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    idCategoryType: { type: Schema.Types.ObjectId, ref: 'CategoryType' },
    postType: Number, // 1 : rieng-biet, 0 : dinh kem theo category , 2 : banner ; 3 : Quảng cáo
    videoUrl: String,
    videoTitle: String,
    datecreate: { type: Date, default: Date.now },
    datePost: { type: Date, default: Date.now },
    normalPrice: Number,
    salePrice: Number,
    pictures: [],
    tags: [],
    visible: { type: Number, default: 1 }, // 1 is visible
    position : String,
});
var Post = mongoose.model('Post', Post);
module.exports = Post;

var createPost = async function(post, opts) {
    return new Promise((resolve, reject) => {
        post = new Post(post);
        resolve(post.save(opts));
    });
}

var createPostContent = async function(post_content, opts) {
    return new Promise((resolve, reject) => {
        post_content = new PostContent(post_content);
        resolve(post_content.save(opts));
    });
}

module.exports.AddPost = async function(post, post_content) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        post_content['oneLvlUrl'] = Tool.change_alias(post_content.title);
        const opts = { session, new: true };
        var lastNameKey = await Post.findOne({ postType: 1 }).sort({ 'datecreate': -1 }).exec();
        // console.log(lastNameKey);
        if (lastNameKey == null) post['nameKey'] = 'nr1000000';
        else {
            var abc = parseInt(lastNameKey.nameKey.replace('nr', '')) + 1;
            post['nameKey'] = 'nr' + abc.toString();
        }
        var savedDoc = await createPost(post, opts);
        post_content['idPost'] = savedDoc._id;
        var saveContent = await createPostContent(post_content, opts);
        console.log(savedDoc, saveContent);

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Thêm bài viết thành công' };
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }


}

module.exports.UpdatePost = async function(post, post_content) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        post_content['oneLvlUrl'] = Tool.change_alias(post_content.title);
        const opts = { session, new: true };
        await Post.findOneAndUpdate({ _id: post._id }, post, opts);
        await PostContent.findOneAndUpdate({ _id: post_content._id }, post_content, opts);

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Update bài viết thành công' };
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }


    // Tweet.findOne({}, {}, { sort: { 'created_at': 1 } }, function(err, post) {
    //     cb(null, post.created_at.getTime());
    // });
}

module.exports.FilterDataTablePost = async function(data) {
    // console.log(data);
    let options = { postType: 1 };
    // if (req.body.idCategoryType) {
    //     options.idCategoryType = mongoose.Types.ObjectId(req.body.idCategoryType);
    // }
    var hot = data[1].value.filter(item => item.data == 'productType')[0];
    if (hot && hot.search.value) {
        options['productType'] = { $elemMatch: { value: hot.search.value } };
    }

    var categoryName = data[1].value.filter(item => item.data == 'categoryName')[0];
    if (categoryName && categoryName.search.value) {
        var listCate = await filterCategoryFromName(categoryName.search.value);
        console.log('listCate', listCate);
        options['idCategory'] = { $in: listCate };
    }


    return Post.aggregate([{
            $match: options,
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
        {
            $project: {
                "categoryName": '$category.name',
                "productType": 1,
                "nameKey": 1,
                "pictures": 1,
                "datePost": 1,
                visible: 1,
                "title": '$postContent.title',
            }
        },
    ], function(err, result) {
        // console.log('post', err, result);

        if (err) result = [];
        return (result);
    })

}