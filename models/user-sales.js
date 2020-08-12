// get an instance of mongoose and mongoose.Schema
var config = require('../config'); // get our config file
const mongoose = require('mongoose');
const User = require('./user');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var UserSales = new Schema({
    idUser: { type: Schema.Types.ObjectId, ref: 'User' },
    idUserIncurred: { type: Schema.Types.ObjectId, ref: 'User' },
    idInvest: { type: Schema.Types.ObjectId, ref: 'UserInvest' },
    datecreate: { type: Date },
    amount: Number,
});
var UserSales = mongoose.model('UserSales', UserSales);
module.exports = UserSales;

module.exports.LoopAddUserSales = async function(userinvest, sponsor, list, opts) {
    try {
        if (!sponsor) {
            console.log('het sponsor', list);
            UserSales.insertMany(list, opts).exec().then((docs) => {
                    console.log('docs', docs);
                    return docs;
                })
                .catch((err) => {
                    console.log('err', err);
                });

        }
        var item = new UserSales({
            idUser: sponsor._id,
            idUserIncurred: userinvest.idUser,
            idInvest: userinvest._id,
            datecreate: userinvest.dateApproved,
            amount: userinvest.amount,
        });
        list.push(item);
        var user = await User.findOne({ _id: sponsor.idSponsor });
        UserSales.LoopAddUserSales(userinvest, user, list, opts);
    } catch (error) {
        return new Error('Lỗi loop sale');
    }

}

module.exports.RunUserSalesFromInvest = async function(userinvest) {
    console.log('bat dau sale')
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const opts = { session, new: true };
        var check = await UserSales.find({ idInvest: userinvest._id });
        if (check.length > 0) {
            throw new Error('Đã cộng doanh số gói này ' + userinvest.dateApproved.toString());
        }
        var user = await User.findOne({ _id: userinvest.idUser });
        // var sponsor = await User.findOne({ _id: user.idSponsor });
        await UserSales.LoopAddUserSales(userinvest, user, [], opts);
        console.log('xong het sale')
        await session.commitTransaction();
        console.log('commitTransaction')
        session.endSession();
        console.log('endSession')

        return { status: true, mes: 'Thêm doanh số nhóm thành công' };
    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        session.endSession();
        return { status: false, mes: error.message };
        throw error; // Rethrow so calling function sees error
    }
}