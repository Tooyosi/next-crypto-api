const nodemailer = require('nodemailer')
const {logger} = require('../loggers/logger')
class SendMail {
    constructor(service) {
        this.service = "https://business63.web-hosting.com/"
        this.auth = {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }

    async dispatch(to, from, subject, text, myCallBack) {
        var smtpTransport = nodemailer.createTransport({
            service: this.service,
            port: 465,
            secure: true,
            tls: {
                rejectUnauthorized:false
            },
            auth: this.auth
        });

        var mailOptions = {
            to: to,
            from: process.env.EMAIL,
            subject: subject,
            html: text
        };
        return await smtpTransport.sendMail(mailOptions, (err) => {
            return myCallBack(err)
        });
    }
}

module.exports = SendMail