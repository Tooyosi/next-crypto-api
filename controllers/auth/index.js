const express = require("express");
const router = express.Router({ mergeParams: true })
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData, addMinutes } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
const SendMail = require('../../helpers/SendMail')
const passport = require('../../helpers/passport')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

module.exports = {
    postLogin: function (req, res, next) {
        let response
        passport.authenticate('local', { session: false }, (err, user, info) => {
            if (err || !user) {

                let resp = info ? info : err.toString()
                response = new BaseResponse(failureStatus, resp, failureCode, {})
                return res.status(403).send(response)
            } else if (info) {
                let resp = info;
                response = new BaseResponse(failureStatus, resp, failureCode, {})
                return res.status(403).send(response)
            }
            req.logIn(user, async function (err) {
                if (err) {
                    let resp = err.toString()
                    response = new BaseResponse(false, resp, failureCode, {})
                    return res.status(403).send(response)
                }
                // if(req.user.us)
                req.token = jwt.sign({
                    id: req.user.user_id,
                    isAdmin: req.user.user_type.dataValues.user_type == "Admin" ? true : false
                }, process.env.SESSION_SECRET, {
                    // expiresIn: 60*2
                });
                let user = {
                    id: req.user.user_id,
                    firstname: req.user.firstname,
                    lastname: req.user.lastname,
                    email: req.user.email,
                    phone: req.user.phone,
                    accountBalance: req.user.balance.balance,
                    isAdmin: req.user.user_type.dataValues.user_type == "admin" ? true : false,
                }
                let refreshToken = req.user.user_id.toString() + '.' + crypto.randomBytes(40).toString('hex');

                let updateUser = await Models.User.findOne({
                    where: {
                        user_id: req.user.user_id
                    }
                })
                let currentDate = new Date(dateTime)

                let expiryDate = addMinutes(currentDate, 30)

                await updateUser.update({
                    access_token: req.token,
                    refresh_token: refreshToken,
                    last_login_date: dateTime,
                    token_expiry_date: expiryDate
                })
                response = new BaseResponse(true, "Successful", successCode, { ...user, token: req.token, refreshToken: refreshToken, expiryDate })
                return res.status(200).send(response);
            });
        })(req, res, next);
    },

}