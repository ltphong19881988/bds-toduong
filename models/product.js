// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var async = require('async');
const Tool = require('./helpers/tool');
const ProductContent = require('./product-content');
const Category = require('./category');
const Post = require('./post');
const PostContent = require('./post-content');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var Product = new Schema({
    nameKey: { type: String, unique: true, required: true }, // pr97590432 .....
    idCategory: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    idCategoryType: { type: Schema.Types.ObjectId, ref: 'CategoryType' },
    duAn: {}, // 
    videoUrl: String,
    videoTitle: String,
    datecreate: { type: Date, default: Date.now },
    normalPrice: Number,
    salePrice: Number,
    pictures: [],
    tags: [],
    acreage: Number,
    alleyWidth: Number,
    direction: {},
    province: {},
    district: {},
    ward: {},
    visible: { type: Number, default: 1 }, // 1 is visible
    productType: []
});
var Product = mongoose.model('Product', Product);
module.exports = Product;

var createProduct = async function(product, opts) {
    return new Promise((resolve, reject) => {
        product = new Product(product);
        resolve(product.save(opts));
    });
}

var createProductContent = async function(product_content, opts) {
    return new Promise((resolve, reject) => {
        product_content = new ProductContent(product_content);
        resolve(product_content.save(opts));
    });
}

var anAsyncMapFunction = async function(item) {
    return functionWithPromise(item)
}

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
                    return item.post.idCategory;
                })).then(abc => {
                    resolve(abc);
                });
            });
        })
        .catch(err => {
            console.log('err', err);
        });

}

module.exports.AddProduct = async function(product, product_content) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        product_content['oneLvlUrl'] = Tool.change_alias(product_content.title);
        const opts = { session, new: true };
        var lastNameKey = await Product.findOne({}).sort({ 'datecreate': -1 }).exec();
        // console.log(lastNameKey);
        if (lastNameKey == null) product['nameKey'] = 'pr1000000';
        else {
            var abc = parseInt(lastNameKey.nameKey.replace('pr', '')) + 1;
            product['nameKey'] = 'pr' + abc.toString();
        }
        var savedDoc = await createProduct(product, opts);
        product_content['idProduct'] = savedDoc._id;
        var saveContent = await createProductContent(product_content, opts);
        console.log(savedDoc, saveContent);

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Tạo sản phẩm thành công' };
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

module.exports.UpdateProduct = async function(product, product_content) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        product_content['oneLvlUrl'] = Tool.change_alias(product_content.title);
        const opts = { session, new: true };
        await Product.findOneAndUpdate({ _id: product._id }, product, opts);
        await ProductContent.findOneAndUpdate({ _id: product_content._id }, product_content, opts);

        await session.commitTransaction();
        session.endSession();
        return { status: true, mes: 'Update sản phẩm thành công' };
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

module.exports.FilterDataTableProduct = async function(data) {
    console.log(data);
    let options = {}
        // if (req.body.idCategoryType) {
        //     options.idCategoryType = mongoose.Types.ObjectId(req.body.idCategoryType);
        // }
    var hot = data[1].value.filter(item => item.data == 'productType')[0];
    if (hot && hot.search.value) {
        options['productType'] = { $elemMatch: { value: hot.search.value } };
    }
    var province = data[1].value.filter(item => item.data == 'province.title')[0];
    if (province && province.search.value) {
        options['province.title'] = { $regex: province.search.value, $options: 'ui' };
    }
    var district = data[1].value.filter(item => item.data == 'district.title')[0];
    if (district && district.search.value) {
        options['district.title'] = { $regex: district.search.value, $options: 'ui' };
    }
    var categoryName = data[1].value.filter(item => item.data == 'categoryName')[0];
    if (categoryName && categoryName.search.value) {
        var listCate = await filterCategoryFromName(categoryName.search.value);
        console.log('listCate', listCate);
        options['idCategory'] = { $in: listCate };
    }


    return Product.aggregate([{
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
                from: "productcontents",
                localField: "_id",
                foreignField: "idProduct",
                as: "productContent"
            },
        },
        { $unwind: "$productContent" },
        {
            $project: {
                "categoryName": '$category.name',
                "productType": 1,
                "nameKey": 1,
                "normalPrice": 1,
                "pictures": 1,
                "salePrice": 1,
                "datecreate": 1,
                "title": '$productContent.title',
                "province": 1,
                "district": 1,
                "ward": 1,
                visible: 1,
            }
        },
    ], function(err, result) {
        // console.log('product', err, result);
        if (err) result = [];
        return (result);
    })

}