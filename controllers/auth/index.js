const express = require("express");
const router = express.Router({ mergeParams: true })
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData, addMinutes } = require('../../helpers/index')
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
                return res.status(404).send(response)
            } else if (info) {
                let resp = info;
                response = new BaseResponse(failureStatus, resp, failureCode, {})
                return res.status(404).send(response)
            }
            req.logIn(user, async function (err) {
                if (err) {
                    let resp = err.toString()
                    response = new BaseResponse(false, resp, failureCode, {})
                    return res.status(404).send(response)
                }
                req.token = jwt.sign({
                    id: req.user.user_id,
                    isAdmin: req.user.user_type.dataValues.user_type == "admin" ? true : false
                }, process.env.SESSION_SECRET, {
                    expiresIn: '3 hours'
                });
                let user = {
                    id: req.user.user_id,
                    firstname: req.user.firstname,
                    lastname: req.user.lastname,
                    email: req.user.email,
                    phone: req.user.phone,
                    country: req.user.country,
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
                },
                include: {
                    model: Models.UserType,
                    as: 'user_type',
                    attributes: ['user_type']

                },
            })
            let { dataValues } = sessionUser
            if (dataValues.refresh_token == refreshToken) {
                req.token = jwt.sign({
                    id: dataValues.user_id,
                    isAdmin: dataValues.user_type.dataValues.user_type == "admin" ? true : false,
                }, process.env.SESSION_SECRET, {
                    expiresIn: '3 hours'
                });
                let refreshToken = dataValues.user_id.toString() + '.' + crypto.randomBytes(40).toString('hex');

                let currentDate = new Date(dateTime)

                let expiryDate = addMinutes(currentDate, 30)

                await sessionUser.update({
                    access_token: req.token,
                    refresh_token: refreshToken,
                    token_expiry_date: expiryDate
                })
                response = new BaseResponse(successStatus, "Success", successCode, { accessToken: req.token, refreshToken: refreshToken, tokenExpiry: expiryDate })
                return res.status(200).send(response)
            } else {
                response = new BaseResponse(failureStatus, "Invalid refresh token", failureCode, {})
                return res.status(400).send(response)

            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400).json(response)

        }
    }),

    forgotPassword: ('/', async (req, res) => {
        let { email } = req.body
        let dateTime = moment.tz(Date.now(), "Africa/Lagos").format().slice(0, 19).replace('T', ' ')
        if (email.trim() == "") {
            response = new BaseResponse(failureStatus, "Email is required", failureCode, {})
            return res.status(400).json(response)
        }
        try {
            let user = await Models.User.findOne({
                where: {
                    email: email
                }
            })

            if (user == null || user == undefined) {
                response = new BaseResponse(failureStatus, "User does not Exist", failureCode, {})
                return res.status(404).json(response)
            }
            let resetToken = crypto.randomBytes(20).toString('hex')
            let currentDate = new Date(dateTime)
            let expiryDate = addMinutes(currentDate, 30)


            let mailSend = new SendMail("Gmail")
            mailSend.dispatch(email, "Next Crypto", "Reset Password", "You are recieving this because you have requested a password reset" +
                "Please click on the following link, or paste into your browser to complete the process \n\n" +
                "http://" + req.headers.host + "/reset/" + resetToken + "\n\n" +
                "If you did not request this, please ignore and your password would remain unchanged", async (err) => {
                    if (err) {
                        logger.error(err)
                        response = new BaseResponse(failureStatus, "An error occured while sending mail", failureCode, {})
                        return res.status(400).json(response)
                    }
                    await user.update({
                        reset_password_token: resetToken,
                        reset_password_expiry: expiryDate
                    })
                    response = new BaseResponse(successStatus, "An Email has been sent with instructions", successCode, {})
                    return res.status(200).json(response)
                })
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400).json(response)
        }
    }),

    getResetToken:('/', async(req, res)=>{
        let {token} = req.params
        try {
            let user = await Models.User.findOne({
                where:{
                    reset_password_token: token
                }
            })            
            if(user == null || user == undefined){
                response = new BaseResponse(failureStatus, "Invalid token", failureCode, {})
                return res.status(400).json(response)
            }else if(moment.tz("Africa/Lagos").unix() > moment.tz(user.dataValues.reset_password_expiry, "Africa/Lagos").unix()){
                await user.update({
                    reset_password_token: null,
                    reset_password_expiry: null
                })
                response = new BaseResponse(failureStatus, "Token Expired", failureCode, {})
                return res.status(400).json(response)
            }else{
                response = new BaseResponse(successStatus, successStatus, successCode, {})
                return res.status(200).json(response)                
            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400).json(response)            
        }
    }),
    postReset:('/', async(req, res)=>{
        let {token} = req.params
        let {password} = req.body
        if(password.trim() == ""){
            response = new BaseResponse(failureStatus, "Password can not be empty", failureCode, {})
            return res.status(400).json(response)
        }
        try {
            let user = await Models.User.findOne({
                where:{
                    reset_password_token: token
                }
            })            
            if(user == null || user == undefined){
                response = new BaseResponse(failureStatus, "Invalid token", failureCode, {})
                return res.status(400).json(response)
            }else if(moment.tz("Africa/Lagos").unix() > moment.tz(user.dataValues.reset_password_expiry, "Africa/Lagos").unix()){
                await user.update({
                    reset_password_token: null,
                    reset_password_expiry: null
                })
                response = new BaseResponse(failureStatus, "Token Expired", failureCode, {})
                return res.status(400).json(response)
            }else{
                await user.update({
                    password: bin2hashData(password, process.env.PASSWORD_HASH),
                    access_token: null,
                    refresh_token: null,
                    token_expiry_date: null,
                    reset_password_token: null,
                    reset_password_expiry: null 
                })
                response = new BaseResponse(successStatus, successStatus, successCode, {})
                return res.status(200).json(response)                
            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400).json(response)            
        }
    }),

    logOut: ('/', async(req, res)=>{
        let {id} = req.user
        try {
            let user = await Models.User.findOne({
                where:{
                    user_id: id
                }
            })
            
            await user.update({
                access_token: null,
                refresh_token: null,
                token_expiry_date: null
            })
            response = new BaseResponse(successStatus, successStatus, successCode, {})
            return res.status(200).json(response)  
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400).json(response)               
        }
    })
}