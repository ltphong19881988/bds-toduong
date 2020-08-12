// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var InvestmentTreeSchema = new Schema({
    idUserInvest: { type: Schema.Types.ObjectId, ref: 'UserInvest' },
    idUser: { type: Schema.Types.ObjectId, ref: 'User' },
    parent: { type: Schema.Types.ObjectId, ref: 'InvestmentTree' },
    level: Number,
    treeAddress: String,
    datecreate: { type: Date }
});
var InvestmentTree = mongoose.model('InvestmentTree', InvestmentTreeSchema);
module.exports = InvestmentTree;


module.exports.Update = function(id, setFields, callback) {
    var query = {
        _id: id,
    };
    InvestmentTree.update(query, setField, { upsert: true }, function(err, up) {
        if (err)
            callback({ status: false, mes: err });
        callback({ status: true, mes: 'update Country successfully' })
    })
}

module.exports.Delete = function(id, callback) {
    InvestmentTree.remove({ _id: id }, function(err) {
        if (!err) {
            callback({ status: true, mes: 'delete Country successfully' });
        } else {
            callback({ status: false, mes: err });
        }
    });
}

module.exports.GetFirstInvestmentTree = function(options) {
    let p1 = new Promise((resolve, reject) => {
        InvestmentTree.aggregate(
            [
                { $match: options },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'idUser',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: 'userinvests',
                        localField: 'idUserInvest',
                        foreignField: '_id',
                        as: 'invest'
                    }
                },
                {
                    $sort: { datecreate: 1 }
                },
                {
                    $project: {
                        _id: 1,
                        idUser: 1,
                        parent: 1,
                        level: 1,
                        treeAddress: 1,
                        datecreate: 1,
                        abc: { $arrayElemAt: ["$user", 0] },
                        xyz: { $arrayElemAt: ["$invest", 0] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        idUser: 1,
                        parent: 1,
                        level: 1,
                        treeAddress: 1,
                        datecreate: 1,
                        username: '$abc.username',
                        package: '$xyz.amount'
                    }
                }
            ]
        ).exec(function(err, result) {
            if (err) reject(err);
            resolve(result);
        });
    })

    return p1;
}

module.exports.GetReferralTree = async function(id) {
    var curTree = await InvestmentTree.findOne({ _id: id }).exec();
    return InvestmentTree.aggregate([{
                $match: {
                    level: curTree.level + 1,
                    treeAddress: { $regex: '^' + curTree.treeAddress + '-' }
                },

            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'idUser',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'userinvests',
                    localField: 'idUserInvest',
                    foreignField: '_id',
                    as: 'invest'
                }
            },
            {
                $project: {
                    _id: 1,
                    idUser: 1,
                    parent: 1,
                    level: 1,
                    treeAddress: 1,
                    datecreate: 1,
                    abc: { $arrayElemAt: ["$user", 0] },
                    xyz: { $arrayElemAt: ["$invest", 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    idUser: 1,
                    parent: 1,
                    level: 1,
                    treeAddress: 1,
                    datecreate: 1,
                    username: '$abc.username',
                    package: '$xyz.amount'
                }
            },
            {
                $sort: { datecreate: -1 }
            }
        ]).exec()
        .then(results => {
            // console.log('results', results)
            return results;
        })
        .catch(err => {
            errorHandler.handle('audienceService', err);
            return [];
        });
}