const jwt = require('jsonwebtoken');
const config = require('../../config'); // get our config file
const secretKey = config.secret;

var MyMiddleware = {};

module.exports = MyMiddleware;

function logOriginalUrl(req, res, next) {
    console.log('Request URL:', req.originalUrl)
    next()
}

function getCookies(cookie, cname) {
    if (!cookie) {
        return "";
    }
    var name = cname + "=";
    var ca = cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

module.exports.isAuthenticated = function(req, res, next) {
    // check header or url parameters or post parameters for token    
    var token = req.body.token || req.query.token || getCookies(req.headers.cookie, "x-access-token");
    // console.log('token', token, req);
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, secretKey, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                // console.log(decoded);
                // if (decoded.verifyEmail != true) {
                //     res.cookie('verify-email', decoded.email, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24) });
                //     return res.redirect('/verify-email');
                // }
                if (decoded.enable2fa == true) {
                    if (decoded.verify2fa == true) {
                        next();
                    } else {
                        res.redirect("/verify-authentication?redirect=" + req.originalUrl);
                    }
                } else {
                    next();
                }
            }
        });

    } else {
        // next();
        res.redirect("/login?redirect=" + req.originalUrl);
        // if there is no token
        // return an error
        // return res.status(403).send({ 
        //     success: false, 
        //     message: 'No token provided.' 
        // });

    }
}

module.exports.RegularUsername = function(str) {
    // $pattern = "/^[a-z0-9_\.]{6,32}$/";
    if (!str)
        return { status: false, mes: "please enter username" };
    var pattern = /^[a-z0-9_]{6,32}$/;
    var match = pattern.test(str);
    if (!match) {
        return { status: false, mes: "Username from 6 - 32  alphanumeric characters and '_'" };
    }
    return { status: true, mes: "" };
}

module.exports.RegularPassword = function(str) {
    //      (/^
    //     (?=.*\d)                //should contain at least one digit
    //     (?=.*[a-z])             //should contain at least one lower case
    //     (?=.*[A-Z])             //should contain at least one upper case
    //     [a-zA-Z0-9]{8,}         //should contain at least 8 from the mentioned characters
    //     $/)
    var pattern = /^(?=.{6,})/;
    var match = pattern.test(str);
    if (!match) {
        return { status: false, mes: "Passsword at least 6 characters" };
    }
    return { status: true, mes: "" };
}

module.exports.randomStr = function(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports.change_alias = function(alias) {
    var str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
    str = str.replace(/ + /g, " ");
    str = str.replace(/ /g, "-");
    str = str.trim();
    return str;
}

module.exports.getUniqueNameKey = function(nameKey, value, model, callback) {
    model.findOne({ nameKey: value }).exec(function(err, result) {
        if (!result) {
            callback(value);
        } else {
            value += '-' + Tool.randomStr(9);
            Tool.getUniqueNameKey(nameKey, value, model, callback);
        }
    })
}

module.exports.ValidateRegister = function(req, res, next) {
    if (!MyMiddleware.RegularUsername(req.body.username.toLowerCase()).status) {
        return res.json({ status: false, mes: MyMiddleware.RegularUsername(req.body.username).mes });
    } else if (!req.body.email || req.body.email == '') {
        return res.json({ status: false, mes: "Vui lòng nhập email" });
    } else if (!req.body.password) {
        return res.json({ status: false, mes: "Vui lòng nhập mật khẩu" });
    } else if (req.body.password != req.body.passwordConfirm) {
        return res.json({ status: false, mes: "Mật khẩu xác nhận không đúng" });
    } else {
        next();
    }
}

module.exports.ValidateLogin = function(req, res, next) {
    if (!req.body.login || req.body.login == '') {
        return res.json({ status: false, mes: "Vui lòng nhập username hoặc email" });
    } else if (!req.body.password) {
        return res.json({ status: false, mes: "Vui lòng nhập mật khẩu" });
    } else {
        next();
    }
}

module.exports.ValidateUpdateUserProfile = function(req, res, next) {
    if (!req.body.info.IdNumber || req.body.info.IdNumber == '') {
        return res.json({ status: false, mes: "Vui lòng nhập CMND" });
    } else if (!req.body.info.phone || req.body.info.phone == '') {
        return res.json({ status: false, mes: "Vui lòng nhập số điện thoại" });
    } else if (!req.body.bankInfo.bankName || req.body.bankInfo.bankName == '') {
        return res.json({ status: false, mes: "Vui lòng nhập tên ngân hàng" });
    } else if (!req.body.bankInfo.bankAccountNumber || req.body.bankInfo.bankAccountNumber == '') {
        return res.json({ status: false, mes: "Vui lòng nhập số tài khoản" });
    } else if (!req.body.bankInfo.bankAccountHolder || req.body.bankInfo.bankAccountHolder == '') {
        return res.json({ status: false, mes: "Vui lòng nhập chủ tài khoản" });
    } else {
        next();
    }
}