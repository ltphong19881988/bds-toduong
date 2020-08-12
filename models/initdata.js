var User = require('./user');
var Group = require('./group');
var UserRole = require('./userrole');
var passwordHasher = require('aspnet-identity-pw');
var mongoose = require('mongoose');

exports.Init = async function() {
    var admin = await Group.findOne({ name: 'admin' }).sort({ priority: 1 }).exec();
    console.log(admin._id, mongoose.Types.ObjectId(admin.id));
    var member = await Group.findOne({ name: 'member' }).sort({ priority: 1 }).exec();
    console.log(member);

    var xxx = {
        username: 'bazan1',
        email: 'bazan1@gmail.com',
        password: passwordHasher.hashPassword('123456'),
        fullname: {
            first_name: 'ba',
            last_name: 'za',
            name: String,
        },
        sponsor: '',
        idSponsor: null,
        sponsorAddress: '0',
        sponsorLevel: 1,
        groups: [member._id],
        parentCode: null,
    }

    User.addUser(xxx, function(result) {
            console.log(result);
        })
        // Group.find({}).sort({ priority: 1 }).exec().then(function(listGroups) {
        //     console.log(listGroups);
        // });

    // User.addUser({ username: 'root', password: '123456', fullname: 'test name', birthday: "2012-08-09T05:30:28.402", datecreate: "2012-08-09T05:30:28.402", email: 'a@gmail.com', admin: false }, 'member', function(data) {
    //     console.log(data);
    // });

};