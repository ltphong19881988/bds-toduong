// get an instance of mongoose and mongoose.Schema
// var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// var config = require('../config'); // get our config file
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var InvestmentPackageSchema = new Schema({
    name: { type: String, unique: true },
    min: Number,
    max: Number,
    sponsorCash: Number,
    sponsorShopping: Number,
    referralBonus: {},
    interestCash: Number,
    interestShopping: Number,
    interestStock: Number,
    interestEducation: Number,
    interestTravel: Number,
    extraBonus: {},
    capitalBack: Number,
    priority: { type: Number },
    type: Number
});
var InvestmentPackage = mongoose.model('InvestmentPackage', InvestmentPackageSchema);
module.exports = InvestmentPackage;

module.exports.Add = function(item, callback) {
    var investPackage = new InvestmentPackage({
        min: item.min,
        max: item.max,
        sponsorCash: item.sponsorCash,
        sponsorShopping: item.sponsorShopping,
        referralBonus: item.referralBonus,
        interest: item.interest,
        interestCash: item.interestCash,
        interestShopping: item.interestShopping,
        interestStock: item.interestStock,
        interestEducation: item.interestEducation,
        interestTravel: item.interestTravel,
        extraBonus: item.extraBonus,
        capitalBack: item.capitalBack,
        priority: item.priority,
        type: item.type
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
    InvestmentPackage.update(query, setField, { upsert: true }, function(err, up) {
        if (err)
            callback({ status: false, mes: err });
        callback({ status: true, mes: 'update Country successfully' })
    })
}

module.exports.Delete = function(id, callback) {
    InvestmentPackage.remove({ _id: id }, function(err) {
        if (!err) {
            callback({ status: true, mes: 'delete Country successfully' });
        } else {
            callback({ status: false, mes: err });
        }
    });
}

module.exports.Init = function(callback) {
    var list = [{
            name: "BLC-1",
            min: 200,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 0,
            type: 0
        },
        {
            name: "BLC-2",
            min: 1000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 1,
            type: 0
        },
        {
            name: "BLC-3",
            min: 2000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 2,
            type: 0
        },
        {
            name: "BLC-4",
            min: 5000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 3,
            type: 0
        },
        {
            name: "BLC-5",
            min: 10000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 4,
            type: 0
        },
        {
            name: "BLC-6",
            min: 20000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 5,
            type: 0
        },

        {
            name: "BLC 1",
            min: 200,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 3.5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 0,
            type: 1
        },
        {
            name: "BLC 2",
            min: 1000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 3.5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 1,
            type: 1
        },
        {
            name: "BLC 3",
            min: 2000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 3.5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 2,
            type: 1
        },
        {
            name: "BLC 4",
            min: 5000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 3.5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 3,
            type: 1
        },
        {
            name: "BLC 5",
            min: 10000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 3.5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 4,
            type: 1
        },
        {
            name: "BLC 6",
            min: 20000,
            sponsorCash: 5,
            sponsorShopping: 2,
            referralBonus: { F1: 10, F2: 7, F3: 5, F4: 1 },
            interestCash: 3.5,
            interestShopping: 1,
            interestStock: 1,
            interestEducation: 0.3,
            interestTravel: 0.2,
            priority: 5,
            type: 1
        }
    ];

    InvestmentPackage.insertMany(list, function(err, docs) {
        // console.log(err, docs);
        if (!err) {
            callback({ status: true, docs });
        } else {
            callback({ status: false, err });
        }
    });
}