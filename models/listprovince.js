// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var ListProvince = new Schema({
    ID: Number,
    stt: Number,
    title: String,
    code: String,
    type: String,
    link: String,
    provinceID: Number,
    provinceTitle: String,
    provinceTitleLink: String,
    districtID: Number,
    districtTitle: String,
    districtTitleLink: String,
});
ListProvince.index({ ID: 1, type: 1 }, { unique: true });
var ListProvince = mongoose.model('ListProvince', ListProvince);
module.exports = ListProvince;


module.exports.GetDayName = function() {
    return "fdafdas";
}