// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// set up a mongoose model and pass it using module.exports
var Role = new Schema({
    name: { type: String, unique: true, required: true },
    action: {
        add: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        write: { type: Boolean, default: false },
        delete: { type: Boolean, default: false }
    },
    des: String,
    priority: Number
});
var Role = mongoose.model('Role', Role);
module.exports = Role;

module.exports.Init = function() {
    var arr = ['Tài khoản', 'Site Config', 'Gói đầu tư', 'Danh mục', 'Sản phẩm'];
    for (let i = 0, p = Promise.resolve(); i < arr.length; i++) {
        p = p.then(_ => new Promise(resolve => {
                Role.findOne({ name: arr[i] }, function(err, rolefinded) {
                    if (err) throw err;

                    if (!rolefinded) {
                        var item = new Role({
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