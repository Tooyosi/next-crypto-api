const express = require("express");
const router = express.Router({ mergeParams: true })
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
const SendMail = require('../../helpers/SendMail')
let mailService = new SendMail("Gmail");
module.exports = {
    signup: ('/', async (req, res) => {
        let { firstname, lastname, email, country, uplineReferralCode, phone, password, isAdmin } = req.body
        var ts = String(new Date().getTime())
        let response
        if (firstname.trim() == "" || lastname.trim() == "" || !validator(email) || country.trim() == "" || password.trim() == "") {
            response = new BaseResponse(failureStatus, validationErrorMessage, failureCode, {})
            return res.status(400)
                .send(response)
        }
        let newPhone = phone 
        if (phone.length != 11 && phone.length != 13) {
            response = new BaseResponse(failureStatus, "Kindly Enter a valid phone number", failureCode, {})
            return res.status(400)
                .send(response)
        }

        try {
            let uplineMember
            if (uplineReferralCode && uplineReferralCode.trim() !== "") {
                uplineMember = await Models.Members.findOne({
                    where: {
                        referral_id: uplineReferralCode
                    }
                })
            }
            let newUser = await Models.User.create({
                firstname: firstname,
                lastname: lastname,
                user_type_id: isAdmin ? 2 : 1,
                password: bin2hashData(password, process.env.PASSWORD_HASH),
                country: country,
                email: email,
                phone: phone,
                date_created: dateTime,
                isActivated: false,
            })

            let newAccount = await Models.Account.create({
                user_id: newUser.dataValues.user_id,
                balance: 0,
                date_updated: dateTime
            })
            let newMember
            if (!isAdmin) {
                newMember = await Models.Members.create({
                    user_id: newUser.dataValues.user_id,
                    upline_user_id: uplineMember !== null && uplineMember !== undefined ? uplineMember.dataValues.user_id : null,
                    parentId: uplineMember !== null && uplineMember !== undefined ? uplineMember.dataValues.user_id : null,
                    current_stage: 1,
                    referral_id: `${email}${newUser.dataValues.user_id}`,
                    account_id: newAccount.account_id
                })
            }else{
                newMember = await Models.Admin.create({
                    user_id: newUser.dataValues.user_id,
                    referral_id: `${email}${newUser.dataValues.user_id}`,
                    account_id: newAccount.account_id
                })
            }

            mailService.dispatch(email, "Next Crypto", "Registeration Successful", '<p>Next Crypto Registration Successful. kindly visit <a href="http://' +req.headers.host + '/activate/' +newMember.dataValues.referral_id +'">this Link</a> to activate your account<p>', (err) => {
                if (err) {
                    logger.error(err)
                }
                response = new BaseResponse(successStatus, successStatus, successCode, `Welcome ${firstname}, we have sent an activation link to your email ${email}. Please click the link to verify your email address and activate your Next crypto account`)
                return res.status(200).send(response)
            })
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }

    })
}