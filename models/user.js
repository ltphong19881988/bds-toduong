// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var async = require('async');
var Schema = mongoose.Schema;
var speakeasy = require('speakeasy');
var passwordHasher = require('aspnet-identity-pw');
var Group = require('./group');
const websiteName = "toc.vn";
// var UserRole   = require('./userrole');

// set up a mongoose model and pass it using module.exports
var UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: String,
    fullname: {
        first_name: String,
        last_name: String,
        name: String,
    },
    info: {
        IdNumber: String,
        phone: String,
        birthday: { type: Date, default: Date.now },
        avatar: { type: String, default: "/uploads/img/no-avatar.png" },
        country: {},
        province: {}
    },
    bankInfo: {
        bankName: String,
        bankAccountNumber: String,
        bankAccountHolder: String,
    },
    sponsor: String,
    idSponsor: { type: Schema.Types.ObjectId, ref: 'User' },
    sponsorAddress: String,
    sponsorLevel: Number,
    datecreate: { type: Date, default: Date.now },
    groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    roles: [],
    free: { type: Number, default: 1 },
    code: { type: Number, unique: true, required: true },
    parentCode: Number,
    lock: { type: Boolean, default: false },
    lockWithdraw: { type: Boolean, default: false },
    smsOTP: { type: String, default: "" },
    verifyEmail: { type: Boolean, default: false },
    verifyEmailCode: String,
    verifyPhone: { type: Boolean, default: false },
    enable2fa: { type: Boolean, default: false },
    secret2fa: {},
    facebook: {},
});

UserSchema.pre('save', function(next) {
    var user = this;
    User.find({ $or: [{ username: user.username }, { email: user.email }] }, function(err, users) {
        if (err) {
            return next(err);
        } else if (users.length > 0) {
            // if (users.find( {email: user.email})){
            // 	user.invalidate('email', 'email is already registered');
            // 	next( new Error("email is already registered"));
            // }
            // else if (users.find(users , {username: user.username})){
            // 	user.invalidate('username', 'username is already taken');
            // 	next( new Error("username is already taken"));
            // }
            //return next( new Error("username or email is already registered"));
            return next()
        } else {
            next();
        }
    })
})

var User = mongoose.model('User', UserSchema);
module.exports = User;

module.exports.addUser = function(item, callback) {
    //implementation code goes here
    async.parallel({
        checkUsername: function(callback) {
            User.findOne({ username: item.username }).exec(function(err, userfinded) {
                if (userfinded == null) callback(null, true);
                else callback(null, false);
            })
        },
        checkEmail: function(callback) {
            User.findOne({ email: item.email }).exec(function(err, userfinded) {
                if (userfinded == null) callback(null, true);
                else callback(null, false);
            })
        },
        // countUser: function(callback) {
        //     User.countDocuments({}, function(err, count) {
        //         callback(null, count);
        //     })
        // }
    }, function(err, results) {
        if (!results.checkUsername) {
            callback({ status: false, mes: "username is existed" });
            return;
        }
        if (!results.checkEmail) {
            callback({ status: false, mes: "email is existed" });
            return;
        }
        var abc = speakeasy.generateSecret({ name: websiteName, issuer: item.username, length: 20 });
        // console.log('address', item.sponsorAddress);
        // console.log('user ne', passwordHasher.hashPassword(item.password));
        var user = new User({
            username: item.username,
            email: item.email,
            // password: passwordHasher.hashPassword(item.password),
            password: item.password,
            fullname: item.fullname,
            info: item.info,
            sponsor: item.sponsor,
            idSponsor: item.idSponsor,
            sponsorAddress: item.sponsorAddress,
            sponsorLevel: item.sponsorLevel,
            datecreate: item.datecreate,
            groups: item.groups,
            roles: item.roles,
            code: item.code,
            parentCode: item.parentCode,
            secret2fa: abc,
            verifyEmailCode: item.verifyEmailCode,
            facebook: item.facebook,
        });
        console.log('chuan bi save ne', user);
        user.save(function(err, savedUser) {
            if (err) {
                // throw err;
                callback({ status: false, mes: "error", err: err });
            } else {
                if (!savedUser) {
                    callback({ status: false, mes: "can't save user" });
                } else {
                    callback({ status: true, mes: "user saved", user: savedUser });
                }
            }
        });

    })

}

module.exports.checkUsername = function(str) {
    return new Promise(function(resolve, reject) {
        User.findOne({ username: str }, function(err, userfinded) {
            if (err) {
                reject(err);
            } else {
                if (userfinded == null) {
                    resolve(false);
                } else if (userfinded) {
                    resolve(true);
                }
            }

        });
    });
}

module.exports.GetUserByUsername = function(str, callback) {
    User.findOne({ username: str }, function(err, userfinded) {
        if (err) {
            throw err;
        }
        if (!userfinded) {
            callback({ status: false, user: null });
        } else if (userfinded) {
            callback({ status: true, user: userfinded });
        }
    }).populate("roles");
}

module.exports.GetUserByEmail = function(str, callback) {
    User.findOne({ email: str }, function(err, userfinded) {
        if (err) {
            // console.log('loi', err);
            return null;
        } else {
            // console.log('user by email', userfinded);
            return userfinded;
        }
    }).populate("roles");
}

module.exports.GetUserByCode = function(num) {
    User.findOne({ code: num }, function(err, userfinded) {
        if (err) {
            // console.log('loi', err);
            return null;
        } else {
            // console.log('user by code', userfinded);
            return userfinded;
        }
    });
}

module.exports.CountSponsorDownline = function(id, callback) {
    console.log('id', id);
    User.countDocuments({ idSponsor: id }).exec(function(err, count) {
        if (err) {
            throw err;
        }
        console.log('count', count);
        return (count);
    })
}

//db.users.find({name: /a/})  //like '%a%'
//db.users.find({name: /^pa/}) //like 'pa%'
//db.users.find({name: /ro$/}) //like '%ro'
module.exports.ListSponsorDownline = function(str, callback) {
    var abc = { $regex: '^' + str + '-' };
    User.find({ sponsorAddress: abc }).sort({ sponsorAddress: 1 }).exec(function(err, userfinded) {
        if (err) {
            throw err;
        }
        if (!userfinded) {
            callback({ status: false, listuser: null });
        } else if (userfinded) {
            callback({ status: true, listuser: userfinded });
        }
    });
}

module.exports.InitMemberTree = async function(id) {
    id = mongoose.Types.ObjectId(id);
    var abc = await User.aggregate([{
            $match: { _id: id },
        },
        {
            $lookup: {
                from: 'usersales',
                localField: '_id',
                foreignField: 'idUser',
                as: 'totalsales'
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                idSponsor: 1,
                sponsorAddress: 1,
                sponsorLevel: 1,
                totalsales: 1
            }
        },
        {
            $unwind: {
                path: '$totalsales',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: {
                    _id: '$_id',
                    username: '$username'
                },
                totalAmount: {
                    $sum: '$totalsales.amount'
                }
            }
        },

    ]).exec();
    if (abc.length > 0) return abc[0];
    else return null;
    // .then(results => {
    //     console.log('results', results)
    //     return results;
    // })
    // .catch(err => {
    //     errorHandler.handle('audienceService', err);
    //     return [];
    // });
}

module.exports.ListF1 = async function(id) {
    id = mongoose.Types.ObjectId(id);
    // var user = await User.findOne({ _id: id }).exec();
    // console.log('user', user, user.username)
    var abc = await User.aggregate([{
            $match: { idSponsor: id },
        },
        {
            $lookup: {
                from: 'usersales',
                localField: '_id',
                foreignField: 'idUser',
                as: 'totalsales'
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                idSponsor: 1,
                sponsorAddress: 1,
                sponsorLevel: 1,
                totalsales: 1
            }
        },
        {
            $unwind: {
                path: '$totalsales',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                _id: {
                    _id: '$_id',
                    username: '$username'
                },
                totalAmount: {
                    $sum: '$totalsales.amount'
                }
            }
        },
        {
            $sort: { totalAmount: -1 }
        }
    ]).exec();
    return abc;
}

module.exports.UpdateUser = function(id, setField, callback) {
    var query = {
        _id: id,
    };
    User.update(query, setField, { upsert: true }, function(err, up) {
        callback(err, up);
    })
}

module.exports.checkEmail = function(str, callback) {
    User.findOne({ email: str }, function(err, emailfinded) {
        if (err) {
            throw err;
        }
        if (!emailfinded) {
            callback(false);
        } else if (emailfinded) {
            callback(true);
        }
    });
}

module.exports.AutoComplete = function(str, callback) {
    //User.find({username : {'$regex' : str, '$options' : 'i'}}, function(err, listfinded){
    User.find({ username: new RegExp(str, 'i') }, function(err, listfinded) {
        if (err) {
            throw err;
        }
        if (!listfinded) {
            callback(null);
        } else if (listfinded) {
            callback(listfinded);
        }
    }).select('username');
}

module.exports.GetPoint = function(iduser, callback) {
    //User.find({username : {'$regex' : str, '$options' : 'i'}}, function(err, listfinded){
    User.findOne({ _id: iduser }, function(err, finded) {
        if (err) {
            throw err;
        }
        if (!finded) {
            callback(0);
        } else if (finded) {
            callback(finded.point);
        }
    }).select('point');
}

// This is a promise function
module.exports.getAllMember = async function(groupName, aoData) {
    // console.log(aoData);
    var group = await Group.findOne({ name: groupName });
    var username = aoData[1].value[1].search.value;
    var options = {
        username: { $regex: username, "$options": "i" },
        email: { $regex: aoData[1].value[2].search.value, "$options": "i" },
        groups: {
            '$elemMatch': {
                '$eq': group._id
            }
        }
    };
    if (aoData[1].value[4].search.value != '') options['verifyEmail'] = (aoData[1].value[4].search.value == 'true');
    if (aoData[1].value[5].search.value != '') options['verifyPhone'] = (aoData[1].value[5].search.value == 'true');

    return User.aggregate([{
                $match: options,
            },
            {
                $sort: { type: 1, datecreate: 1 }
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
        .then(result => {
            var totalCount = 0;
            if (result[0].totalCount[0]) totalCount = result[0].totalCount[0].count;
            var records = {
                'draw': aoData[0].value,
                'recordsTotal': 2,
                'recordsFiltered': totalCount,
                'data': result[0].paginatedResults
            };
            return records;
        })
        .catch(err => {
            console.log('audienceService', err);
            var records = {
                'draw': aoData[0].value,
                'recordsTotal': 0,
                'recordsFiltered': 0,
                'data': []
            };
            return records;
        });
}

//      Find all member have group equal
// [
//     {
//       '$match': {
//         'groups': {
//           '$elemMatch': {
//             '$eq': new ObjectId('5e12e16a3dbbfe1e0cb40758')
//           }
//         }
//       }
//     }
//   ]

//      Find all member have group in array
// [
//     {
//       '$match': {
//         'groups': {
//           '$elemMatch': {
//             '$in': [
//               new ObjectId('5e12e16a3dbbfe1e0cb40757'), new ObjectId('5e12e16a3dbbfe1e0cb40758')
//             ]
//           }
//         }
//       }
//     }
//   ]