// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
var AppConfig = new Schema({
    key: { type: String, unique: true },
    type: { type: String, default: 'string' },
    value: Object
});
var AppConfig = mongoose.model('AppConfig', AppConfig);
module.exports = AppConfig;


module.exports.Init = function() {
    var arr = [{
            key: 'deposit-rate',
            value: 23000,
        },
        {
            key: 'withdraw-rate',
            value: 24000,
        }
    ];
    for (let i = 0, p = Promise.resolve(); i < arr.length; i++) {
        p = p.then(_ => new Promise(resolve => {
                AppConfig.findOne({ key: arr[i].key }, function(err, rolefinded) {
                    if (err) throw err;

                    if (!rolefinded) {
                        var item = new AppConfig(arr[i]);
                        // save the sample user
                        item.save(function(err) {
                            if (err) throw err;
                            console.log('AppConfig ' + arr[i] + ' saved successfully');
                            resolve();
                        });
                    } else if (rolefinded) {
                        console.log(' AppConfig ' + arr[i] + ' is existed.');
                        resolve();
                    }
                });
            }

        ));
    }
}