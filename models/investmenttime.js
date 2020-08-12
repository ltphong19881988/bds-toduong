// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var InvestmentTimeSchema = new Schema({
    name: { type: String, unique: true },
    month: Number,
    stockBonus: Number,
    capitalBack: Number,
    priority: { type: Number, unique: true }
});
var InvestmentTime = mongoose.model('InvestmentTime', InvestmentTimeSchema);
module.exports = InvestmentTime;

module.exports.Add = function(item, callback) {
    var investPackage = new InvestmentTime({
        min: item.min,
        max: item.max,
        sponsorBonus: item.sponsorBonus,
        referralBonus: item.referralBonus,
        interest: item.interest,
        extraBonus: item.extraBonus,
        capitalBack: item.capitalBack,
        tradeBonus: item.tradeBonus,
        priority: item.priority,
    });

    investPackage.save(function(err, result) {
        if (err) {
            callback({ status: false, result: null });
            throw err;
        } else {
            callback({ status: true, result });
        }
    });
}

module.exports.Update = function(id, setFields, callback) {
    var query = {
        _id: id,
    };
    InvestmentTime.update(query, setField, { upsert: true }, function(err, up) {
        if (err)
            callback({ status: false, mes: err });
        callback({ status: true, mes: 'update Country successfully' })
    })
}

module.exports.Delete = function(id, callback) {
    InvestmentTime.remove({ _id: id }, function(err) {
        if (!err) {
            callback({ status: true, mes: 'delete Country successfully' });
        } else {
            callback({ status: false, mes: err });
        }
    });
}

module.exports.Init = function(callback) {
    var list = [{
            name: "9 tháng",
            month: 9,
            stockBonus: 2,
            priority: 0
        },
        {
            name: "15 tháng",
            month: 15,
            stockBonus: 2.5,
            priority: 1
        },
        {
            name: "18 tháng",
            month: 18,
            stockBonus: 3,
            priority: 2
        }
    ];

    InvestmentTime.insertMany(list, function(err, docs) {
        console.log(err, docs);
        if (!err) {
            callback({ status: true, docs });
        } else {
            callback({ status: false, err });
        }
    });
}