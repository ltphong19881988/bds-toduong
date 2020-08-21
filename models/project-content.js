// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var ProjectContent = new Schema({
    idProject: { type: Schema.Types.ObjectId, ref: 'Project' },
    languageCode: { type: String, default: 'vn' },
    title: { type: String },
    oneLvlUrl: { type: String, unique: true },
    descriptions: String,
    content: String,
    seoKeyWord: String,
    seoDescriptions: String,

});
var ProjectContent = mongoose.model('ProjectContent', ProjectContent);
module.exports = ProjectContent;

module.exports.Init = function() {


}