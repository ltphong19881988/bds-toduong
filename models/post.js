// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var Post = new Schema({
    nameKey: { type: String },
    idCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    idCategoryType: { type: Schema.Types.ObjectId, ref: 'CategoryType' },
    postType: Number, // 1 : rieng-biet, 0 : dinh kem theo category , 2 : banner ;
    videoUrl: String,
    videoTitle: String,
    datecreate: { type: Date, default: Date.now },
    normalPrice: Number,
    salePrice: Number,
    pictures: [],
    tags: [],
    visible: { type: Number, default: 1 }, // 1 is visible
});
var Post = mongoose.model('Post', Post);
module.exports = Post;

module.exports.Init = function() {


}