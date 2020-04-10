const nodemailer = require('nodemailer')
const {logger} = require('../loggers/logger')
class SendMail {
    constructor(service) {
        this.service = service
        this.auth = {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }

    async dispatch(to, from, subject, text, myCallBack) {
        var smtpTransport = nodemailer.createTransport({
            service: this.service,
            auth: this.auth
        });

        var mailOptions = {
            to: to,
            from: from,
            subject: subject,
            html: text
        };
        return await smtpTransport.sendMail(mailOptions, (err) => {
            return myCallBack(err)
        });
    }
}

module.exports = SendMail