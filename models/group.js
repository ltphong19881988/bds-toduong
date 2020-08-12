// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var Group = new Schema({
    name: { type: String, unique: true, required: true },
    des: String,
    priority: Number
});
var Group = mongoose.model('Group', Group);
module.exports = Group;

module.exports.Init = function() {
    var arr = ['admin', 'member', 'partner', 'agency'];
    for (let i = 0, p = Promise.resolve(); i < arr.length; i++) {
        p = p.then(_ => new Promise(resolve => {
                Group.findOne({ name: arr[i] }, function(err, rolefinded) {
                    if (err) throw err;

                    if (!rolefinded) {
                        var item = new Group({
                            name: arr[i],
                            // des: 'admin basic',
                            priority: i
                        });
                        // save the sample user
                        item.save(function(err) {
                            if (err) throw err;
                            console.log('Role ' + arr[i] + ' saved successfully');
                            resolve();
                        });
                    } else if (rolefinded) {
                        console.log(' Role ' + arr[i] + ' is existed.');
                        resolve();
                    }
                });
            }

        ));
    }




}



// Group.findOne({ name: 'admin' }, function(err, rolefinded) {
//     if (err) throw err;

//     if (!rolefinded) {
//         var admin = new Role({
//             name: 'admin',
//             des: 'admin basic',
//             priority: 0
//         });
//         // save the sample user
//         admin.save(function(err) {
//             if (err) throw err;
//             console.log('Role admin saved successfully');
//         });
//     } else if (rolefinded) {
//         console.log(' Role admin is existed.');
//     }
// });

// Group.findOne({ name: 'member' }, function(err, rolefinded) {
//     if (err) throw err;

//     if (!rolefinded) {
//         var member = new Role({
//             name: 'member',
//             des: 'member basic',
//             priority: 1
//         });
//         // save the sample user
//         member.save(function(err) {
//             if (err) throw err;
//             console.log('Role member saved successfully');
//         });
//     } else if (rolefinded) {
//         console.log(' Role member is existed.');
//     }
// });

// Group.findOne({ name: 'partner' }, function(err, rolefinded) {
//     if (err) throw err;

//     if (!rolefinded) {
//         var admin = new Role({
//             name: 'partner',
//             des: 'partner basic',
//             priority: 0
//         });
//         // save the sample user
//         admin.save(function(err) {
//             if (err) throw err;
//             console.log('Role partner saved successfully');
//         });
//     } else if (rolefinded) {
//         console.log(' Role partner is existed.');
//     }
// });

// Group.findOne({ name: 'agency' }, function(err, rolefinded) {
//     if (err) throw err;

//     if (!rolefinded) {
//         var admin = new Role({
//             name: 'agency',
//             des: 'agency basic',
//             priority: 0
//         });
//         // save the sample user
//         admin.save(function(err) {
//             if (err) throw err;
//             console.log('Role agency saved successfully');
//         });
//     } else if (rolefinded) {
//         console.log(' Role agency is existed.');
//     }
// });