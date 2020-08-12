// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var Transaction = new Schema({
    currencyType: String, // VND, USD, BTC, ....
    walletType: String, // Tiền mặt hoa hồng
    source: String, // plus, minus
    method: { type: String, required: true }, // buy, sell, deposit, withdraw, send, get, fee, commission, invest
    methodType: { type: String, required: true }, // if commission we have many type
    walletAmount: Number,
    idUser: Schema.Types.ObjectId,
    idUserIncurred: Schema.Types.ObjectId,
    address: String, // address of btc or vnc
    amount: Number,
    datecreate: { type: Date, default: Date.now },
    dateapproved: { type: Date },
    status: Number, // -1 cancel, 0 pending, 1 approved
    txid: String,
    contract: {
        id: { type: String },
        images: []
    },
    idFromTree: Schema.Types.ObjectId,
    idParentTree: Schema.Types.ObjectId,
    idInvestmentPackage: Schema.Types.ObjectId,
    idUserInvest: Schema.Types.ObjectId,
    description: String,
    real: { type: Boolean, default: true }
});
var Transaction = mongoose.model('Transaction', Transaction);
module.exports = Transaction;

// module.exports.Add = function(item, callback) {
//     var Trans = new Transaction({
//         currencyType: item.currencyType,
//         walletType: item.walletType, // btc or vnc
//         source: item.source,
//         method: item.method,
//         methodType: item.methodType,
//         walletAmount: item.walletAmount,
//         idUser: item.idUser,
//         idUserIncurred: item.idUserIncurred,
//         address: item.address,
//         amount: item.amount,
//         datecreate: item.datecreate,
//         status: item.status,
//         txid: item.txid,
//         idHistory: item.idHistory,
//         idInvestmentPackage: item.idInvestmentPackage,
//         description: item.description,
//         real: item.real
//     });

//     Trans.save(function(err, result) {
//         if (err) {
//             callback({ status: false, result: null });
//             // throw err;
//         } else {
//             //console.log(result);
//             callback({ status: true, result });
//         }
//     });

// }

module.exports.Update = function(id, setFields, callback) {
    var query = {
        _id: id,
    };
    Transaction.update(query, setField, { upsert: true }, function(err, up) {
        if (err)
            callback({ status: false, mes: err });
        callback({ status: true, mes: 'update transaction successfully' })
    })
}

module.exports.Delete = function(id, callback) {
    Transaction.remove({ _id: id }, function(err) {
        if (!err) {
            callback({ status: true, mes: 'delete transaction successfully' });
        } else {
            callback({ status: false, mes: err });
        }
    });
}

module.exports.GetWalletDetailsTransactions = function(aoData, options) {
    console.log(aoData, options);
    // var packageType = body.aoData[1].value[2].search.value; // body['columns[2][search][value]']
    // // console.log(packageType);
    // var username = body.aoData[1].value[1].search.value;
    // if (packageType) option['investPackage.type'] = parseInt(packageType);

    // if (body.aoData[1].value[6].search.value != '') {
    //     option['status'] = (body.aoData[1].value[6].search.value == 'true');
    // }

    // console.log('option', option);
    return Transaction.aggregate([{
                $match: options,
            },
            {
                $sort: { datecreate: -1 }
            },
            {
                $facet: {
                    paginatedResults: [{ $skip: aoData[3].value }, { $limit: aoData[4].value }],
                    totalCount: [{
                        $count: 'count'
                    }]
                }
            }
        ]).exec()
        .then(results => {
            // console.log(results);
            var totalCount = 0;
            if (results[0].totalCount[0]) totalCount = results[0].totalCount[0].count;
            var records = {
                'draw': aoData[0].value,
                'recordsTotal': 2,
                'recordsFiltered': totalCount,
                'data': results[0].paginatedResults
            };
            return (records);
        })
        .catch(err => {
            console.log('err', err);
            // errorHandler.handle('audienceService', err);
            var records = {
                'draw': aoData[0].value,
                'recordsTotal': 0,
                'recordsFiltered': 0,
                'data': []
            };
            return (records);
        });
}