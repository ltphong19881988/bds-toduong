// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var async = require('async');
const Tool = require('./helpers/tool');
const ProductContent = require('./product-content');
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