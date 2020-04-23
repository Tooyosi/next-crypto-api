const express = require("express");
const router = express.Router({ mergeParams: true })
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const {  successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData, addMinutes } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
const SendMail = require('../../helpers/SendMail')
const passport = require('../../helpers/passport')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const moment = require('moment-timezone')

module.exports = {
    postLogin: function (req, res, next) {
        let response, dateTime
        dateTime = moment.tz(Date.now(), "Africa/Lagos").format().slice(0, 19).replace('T', ' ')
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
                req.token = jwt.sign({
                    id: req.user.user_id,
                    isAdmin: req.user.user_type.dataValues.user_type == "admin" ? true : false
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

    refreshToken: ('/', async (req, res) => {
        let { refreshToken, token } = req.body
        let response
        let dateTime = moment.tz(Date.now(), "Africa/Lagos").format().slice(0, 19).replace('T', ' ')
        if (refreshToken.trim() == "" || token.trim() == "") {
            response = new BaseResponse(false, "One or more parameters are missing", failureCode, {})
            return res.status(400).json(response)
        }
        try {
            let sessionUser = await Models.User.findOne({
                where: {
                    user_id: req.user.id
                }
            })
            let { dataValues } = sessionUser
            if (dataValues.refresh_token == refreshToken) {
                req.token = jwt.sign({
                    id: dataValues.user_id,
                }, process.env.SESSION_SECRET, {
                });
                let refreshToken = dataValues.user_id.toString() + '.' + crypto.randomBytes(40).toString('hex');

                let currentDate = new Date(dateTime)

                let expiryDate = addMinutes(currentDate, 30)

                await sessionUser.update({
                    access_token: req.token,
                    refresh_token: refreshToken,
                    token_expiry_date: expiryDate
                })
                response = new BaseResponse(true, "Success", successCode, { accessToken: req.token, refreshToken: refreshToken, tokenExpiry: expiryDate })
                return res.status(200).send(response)
            } else {
                response = new BaseResponse(true, "Invalid refresh token", failureCode, {})
                return res.status(400).send(response)

            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(false, error.toString(), failureCode, {})
            return res.status(400).json(response)

        }
    })
}