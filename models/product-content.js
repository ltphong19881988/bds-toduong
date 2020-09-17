// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var ProductContent = new Schema({
    idProduct: { type: Schema.Types.ObjectId, ref: 'Product' },
    languageCode: { type: String, default: 'vn' },
    title: { type: String },
    oneLvlUrl: { type: String, unique: true },
    descriptions: String,
    content: String,
    seoKeyWord: String,
    seoDescriptions: String,
    seoSocial : {}
});
var ProductContent = mongoose.model('ProductContent', ProductContent);
module.exports = ProductContent;

module.exports.Init = function() {


}