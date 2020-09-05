// get an instance of mongoose and mongoose.Schema
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('./../config'); // get our config file
var mongoose = require('mongoose');
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

module.exports.FilterAllDataTable = async function(data) {
    return OneLvlUrl.aggregate([
        // { $match: options },
        {
            $lookup: {
                from: "categories",
                localField: "idCategory",
                foreignField: "_id",
                as: "category"
            },
        },
        { $unwind: "$category" },
        { $sort: { oneLvlUrl: 1 } }
    ], function(err, result) {
        if (err) result = [];
        return (result);
    });

}