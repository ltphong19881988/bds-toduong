const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const nodemailer = require("nodemailer");
const AppConfig = require('../app-config');


var MyFunction = {};
module.exports = MyFunction;


module.exports.RandomString = function(length) {
    let p1 = new Promise((resolve, reject) => {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        resolve(text);
    })
    return p1;
}


////// -------   FUNCTION FOR EMAIL EMAIL
module.exports.senGmailEmail = async function(from, subject, receivers, text, html) {
    try {
        var acc = await AppConfig.findOne({ key: 'gmail' });
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            // service: 'gmail',
            auth: {
                user: acc.value.email, // generated ethereal user
                pass: acc.value.password // generated ethereal password
            }
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: from + '<' + acc.value.email + '>', // sender address   '"Fred Foo 👻" <foo@example.com>'
            to: receivers, // list of receivers "bar@example.com, baz@example.com"
            subject: subject, // Subject line
            text: text, // plain text body "Hello world?"
            html: html, // html body "<b>Hello world?</b>"
            attachments: [{
                filename: 'Logo.png',
                path: 'https://bazanlandcapital.com/main/images/logo.png',
                cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
            }]
        });


        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        return { status: true, info, mes: 'Gửi email thành công' };
    } catch (err) {
        // console.log(err);
        return { status: false, err, mes: "Gửi email thất bại, vui lòng thử lại sau" };
    }

}

module.exports.sendVerifyEmail = async function(user) {
    var kk = 'https://bazanlandcapital.com/confirm-email/' + user.verifyEmailCode;
    var html = `<center>
            <img style="max-width:200px" src="cid:logo" />
            <h2>Xin Chào : ` + user.username + `</h2>
            <p>Xin xác thực việc đăng ký tài khoản bazanland group cách click vào đường link dưới đây.</p>
            <a target="blank" href="` + kk + `"> ` + kk + `</a>
    </center>`;
    return await MyFunction.senGmailEmail('BazanLand Group', 'Xác thực đăng ký tài khoản', user.email, '', html);
}

module.exports.sendVerifyWithdrawEmail = async function(user, tran, code) {
    var html = `<center>
                    <img style="max-width:200px" src="cid:logo" />
                    <h2>Xin Chào : ` + user.username + `</h2>
                    <p>Bạn đã thực hiện một yêu cầu rút tiền . Mã xác thực : <b>` + code + `</b></p>
                </center>`;
    var info = await MyFunction.senGmailEmail('BazanLand Group', 'Mã xác thực rút tiền', user.email, '', html);
    return info;
}


////// -------   FUNCTION FOR UPLOAD FILE
module.exports.verifyFolderUpload = async function(path, name) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path + name)) {
            // Do something
            fs.mkdirSync(path + name);
            resolve();
        } else {
            resolve();
        }
    })

}