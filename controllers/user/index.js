const express = require("express");
const uuid = require('uuid').v4
const multer = require('multer')
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData, convertDate, getDay } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
const SendMail = require('../../helpers/SendMail')
let getAncestors = require('../../helpers/getAncestors')
let getPaymentTypes = require('../../helpers/GetPaymentTypes')
let getIncompleteDownlines = require('../../helpers/getIncompleteDownline')
let mailService = new SendMail("Gmail");
const updateAccount = require('../../helpers/updateAccount')
const Op = require('sequelize').Op
let createNotifications = require('../../helpers/createNotification');
const moment = require('moment-timezone');
const uploadFunction = require('../../helpers/multer')
const upload = uploadFunction('./uploads/payment')
var uploader = upload.single('userImage')
var client = require('../../helpers/CoinBaseClient')

module.exports = {
    signup: ('/', async (req, res) => {
        uploader(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                logger.error(err.message ? err.message : err.toString())
                response = new BaseResponse(failureStatus, err.message ? err.message : err.toString(), failureCode, {})
                return res.status(400)
                    .send(response)
            } else if (err) {
                logger.error(err.toString())
                response = new BaseResponse(failureStatus, err.message ? err.message : err.toString(), failureCode, {})
                return res.status(400)
                    .send(response)
            } else {
                let { firstname, lastname, email, country, uplineReferralCode, phone, password, isAdmin, paystackReference, paymentMode, signupOption } = req.body

                var ts = String(new Date().getTime())
                let response, memberUplineId
                if (firstname.trim() == "" || lastname.trim() == "" || !validator(email) || country.trim() == "" || password.trim() == "") {
                    response = new BaseResponse(failureStatus, validationErrorMessage, failureCode, {})
                    return res.status(400)
                        .send(response)
                } if (signupOption == "1" && paymentMode == "4" && paystackReference.trim() == "") {
                    response = new BaseResponse(failureStatus, "No payment made", failureCode, {})
                    return res.status(400)
                        .send(response)
                } if (signupOption == "1" && paymentMode != "4" && (req.file == null || req.file == undefined)) {
                    response = new BaseResponse(failureStatus, "Upload proof of payment", failureCode, {})
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
                    if (signupOption == "1" && uplineMember !== null && uplineMember !== undefined) {
                        memberUplineId = { member_id: uplineMember.dataValues.member_id, user_id: uplineMember.dataValues.user_id }
                        let allDownlines = await Models.Members.findAll({
                            where: {
                                parentMember_id: uplineMember.dataValues.member_id
                            }
                        })

                        if (allDownlines.length >= 5) {
                            let incompleteDownlines = await getIncompleteDownlines(uplineMember.dataValues.user_id)
                            memberUplineId = incompleteDownlines[0]
                        }
                    }

                    let isApproved = false
                    if (paymentMode == "4" || isAdmin == true) {
                        isApproved = true
                    } else if (signupOption == "2") {
                        isApproved = true
                    } else {
                        isApproved = false
                    }
                    let newUser = await Models.User.create({
                        firstname: firstname,
                        lastname: lastname,
                        user_type_id: isAdmin == true ? 2 : 1,
                        password: bin2hashData(password, process.env.PASSWORD_HASH),
                        country: country,
                        email: email,
                        phone: phone,
                        date_created: convertDate(Date.now()),
                        payment_mode: signupOption == "1" ? getPaymentTypes(paymentMode) : null,
                        payment_proof: req.file && req.file.path ? req.file.path : null,
                        isAffiliate: signupOption == "1" || isAdmin == true ? true : false,
                        isApproved: isApproved,
                        isActivated: false,
                        payment_reference: signupOption == "1" ? paystackReference : null
                    })

                    let newAccount = await Models.Account.create({
                        user_id: newUser.dataValues.user_id,
                        balance: 0,
                        date_updated: convertDate(Date.now())
                    })
                    let newMember
                    console.log(isAdmin)
                    if (isAdmin == false || isAdmin == "false") {
                        newMember = await Models.Members.create({
                            user_id: newUser.dataValues.user_id,
                            upline_user_id: memberUplineId !== null && memberUplineId !== undefined ? memberUplineId.user_id : null,
                            parentId: memberUplineId !== null && memberUplineId !== undefined ? memberUplineId.member_id : null,
                            current_stage: 1,
                            referral_id: `${newUser.dataValues.user_id}${uuid()}`,
                            sponsor_id: uplineMember ? uplineMember.user_id : null,
                            account_id: newAccount.account_id,
                            parentMember_id: memberUplineId !== null && memberUplineId !== undefined ? memberUplineId.member_id : null,
                        })

                        if (signupOption == "1") {
                            await getAncestors(newUser.dataValues.user_id)
                        }
                    } else {
                        newMember = await Models.Admin.create({
                            user_id: newUser.dataValues.user_id,
                            referral_id: uuid(),
                            account_id: newAccount.account_id
                        })
                    }
                    let successText
                    if (signupOption == "1" && paymentMode != "4") {
                        successText = 'Next Crypto Registration Successful. Your account is subject to approval'
                    } else {
                        successText = 'Next Crypto Registration Successful. kindly visit ' + process.env.FRONTEND_URL + '/user/' + newUser.dataValues.user_id + '/activate to activate your account'
                    }
                    mailService.dispatch(email, "Next Crypto", "Registeration Successful", successText, (err) => {
                        if (err) {

                            let failText
                            if (signupOption == "1" && paymentMode != "4") {
                                failText = 'Next Crypto Registration Successful. Your account is subject to approval'
                            } else {
                                failText = 'Next Crypto Registration Successful. kindly visit ' + process.env.FRONTEND_URL + '/user/' + newUser.dataValues.user_id + '/activate to activate your account'
                            }
                            // logger.error(err)
                            response = new BaseResponse(successStatus, successStatus, successCode, failText)

                        } else {
                            response = new BaseResponse(successStatus, successStatus, successCode, `Welcome ${firstname}, we have sent a mail to ${email}. Kindly follow the instructionsto activate your Next crypto account`)
                        } return res.status(200).send(response)
                    })
                } catch (error) {
                    logger.error(error.toString())
                    response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
                    return res.status(400)
                        .send(response)
                }
            }
        })

    }),

    validateMail: ('/', async (req, res) => {
        let { email } = req.params

        let response
        try {
            let members = await Models.User.findAll({
                where: {
                    email: email
                }
            })
            if (members.length > 0) {
                response = new BaseResponse(failureStatus, "User Already Exists", failureCode, {})
                return res.status(400)
                    .send(response)
            } else {
                response = new BaseResponse(successStatus, successStatus, successCode, {})
                return res.status(200)
                    .send(response)
            }

        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),

    activate: ('/', async (req, res) => {
        let { id } = req.params
        let response
        try {
            let foundUser = await Models.User.findOne({
                where: {
                    user_id: id
                }
            })
            if (foundUser == null || foundUser == undefined) {
                response = new BaseResponse(failureStatus, "User not found", failureCode, {})
                return res.status(404)
                    .send(response)
            } else if (foundUser.dataValues.isActivated == true) {
                response = new BaseResponse(failureStatus, "User already activated", failureCode, {})
                return res.status(400)
                    .send(response)

            } else {
                await foundUser.update({
                    isActivated: true
                })
                response = new BaseResponse(successStatus, successStatus, successCode, {})
                return res.status(200)
                    .send(response)
            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)

        }
    }),

    postTransactions: ('/', async (req, res) => {
        let { id } = req.params;
        let { type, amount, currency, status, reference } = req.body
        let newReference
        if (!reference || reference.trim() == "") {
            newReference = uuid()
        } else {
            newReference = reference
        }
        let response;
        let transObj = {
            amount: Number(amount),
            transaction_status: status !== "" ? status : "pending",
            date: convertDate(Date.now()),
            user_id: id,
            transaction_reference: newReference
        }
        if (Number(amount) < 1) {
            response = new BaseResponse(failureStatus, "Invalid Amount", failureCode, {})
            return res.status(400)
                .send(response)

        }
        if ((type == 2 && currency == 1) && (!reference || reference.trim() == "")) {
            response = new BaseResponse(failureStatus, "Payment Reference Is not defined", failureCode, {})
            return res.status(400)
                .send(response)
        }
        try {
            switch (type) {
                case 1:
                    transObj.transaction_type = "Withdrawal"
                    break;
                case 2:
                    transObj.transaction_type = "Deposit"
                    break
            }

            switch (currency) {
                case 1:
                    transObj.currency = "Naira"
                    break;
                case 2:
                    transObj.currency = "Bitcoin"
                    break
                case 3:
                    transObj.currency = "TAC"
                    break
            }
            let userAccount = await Models.Account.findOne({
                where: {
                    user_id: id
                }
            })
            if (type == 1 && Number(amount) > Number(userAccount.dataValues.balance)) {
                response = new BaseResponse(failureStatus, "Insufficient Funds", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            let newTransaction = await Models.Transactions.create(transObj);
            if (type == 2 && reference.trim() !== "") {

                // console.log("here")


                let newAmt = Number(userAccount.dataValues.balance) + Number(amount)
                let update = await updateAccount(userAccount, newAmt, convertDate(Date.now()))
            }
            if (newTransaction) {
                response = new BaseResponse(successStatus, successStatus, successCode, `Transaction with reference - ${newReference} has been created. Kindly view transactions list to monitor your transactions status`)
                return res.status(201)
                    .send(response)
            } else {
                response = new BaseResponse(failureStatus, "An error occured while creating transaction", failureCode, {})
                return res.status(400)
                    .send(response)
            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),

    getTransactions: ('/', async (req, res) => {
        let { id } = req.params
        let { amount, reference, status, offset, date, type } = req.query
        let whereObj = {
            user_id: id
        }
        if (amount && amount !== "") {
            whereObj.amount = amount
        }
        if (reference && reference !== "") {
            whereObj.transaction_reference = reference
        }
        if (status && status !== "") {
            whereObj.transaction_status = status
        }
        if (date && date !== "") {
            whereObj.date = date
        }
        if (type && type !== "") {
            whereObj.transaction_type = type
        }

        try {
            let allTransactions = await Models.Transactions.findAndCountAll({
                where: whereObj,
                offset: offset ? Number(offset) : offset,
                limit: 10,
                order: [['transaction_id', 'DESC']],
                include: {
                    model: Models.Members,
                    as: "member",
                    attributes: ["account_name", "account_number", "bitcoin_wallet", "bank_name"],
                    include: {
                        model: Models.User,
                        as: "attributes",
                        attributes: ["user_id", "firstname", "lastname", "email"],
                    }
                }
            })
            response = new BaseResponse(successStatus, successStatus, successCode, allTransactions)
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    getNotifications: ('/', async (req, res) => {
        let { id } = req.params
        let { date, offset } = req.query
        let whereObj = {
            user_id: id
        }

        if (date && date !== "") {
            let lessDate = new Date(date)
            lessDate.setDate(lessDate.getDate() + 1);
            whereObj.date = {
                [Op.gt]: getDay(incomingDate),
                [Op.lt]: getDay(lessDate)
            }
            // whereObj.date = date
        }

        try {
            let allNotifications = await Models.Notifications.findAndCountAll({
                where: whereObj,
                offset: offset ? Number(offset) : offset,
                limit: 10,
                order: [['notification_id', 'DESC']],
            })
            response = new BaseResponse(successStatus, successStatus, successCode, allNotifications)
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),

    transfer: ('/', async (req, res) => {
        let { id } = req.params
        let { recepientId, amount } = req.body
        let response;
        if (amount < 1) {
            response = new BaseResponse(failureStatus, "Invalid Amount", failureCode, {})
            return res.status(400)
                .send(response)
        }
        try {
            let sender = await Models.Account.findOne({
                where: {
                    user_id: id
                }
            })

            if (sender == null || sender == undefined) {
                response = new BaseResponse(failureStatus, "Invalid User", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            if (Number(sender.balance) < Number(amount)) {
                response = new BaseResponse(failureStatus, "Insufficient Funds", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            let recepient = await Models.Account.findOne({
                where: {
                    user_id: recepientId
                }
            })
            if (recepient == null || recepient == undefined) {
                response = new BaseResponse(failureStatus, "Invalid Recepient", failureCode, {})
                return res.status(400)
                    .send(response)
            }

            let newSenderBalance = Number(sender.balance) - amount
            let newRecepientBalance = Number(recepient.balance) + amount

            await sender.update({
                balance: newSenderBalance
            })

            await recepient.update({
                balance: newRecepientBalance
            })
            await Models.Transfers.create({
                sender_id: id,
                recepient_id: recepientId,
                date: convertDate(Date.now()),
                amount: amount
            })
            response = new BaseResponse(successStatus, successStatus, successCode, "Transfer Successful")
            return res.status(200)
                .send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),

    editUser: ('/', async (req, res) => {
        let { id } = req.params
        let response
        let { firstname, lastname, phone, country } = req.body
        let updateObj = {
            date_updated: convertDate(Date.now())
        }
        if (firstname.trim() == "" && lastname.trim() == "" && phone.trim() == "" && country.trim() == "") {
            response = new BaseResponse(failureStatus, "One or more parameters are invalid", failureCode, {})
            return res.status(400)
                .send(response)
        }
        if (phone && phone.length !== 11) {
            response = new BaseResponse(failureStatus, "Invalid phone number", failureCode, {})
            return res.status(400)
                .send(response)
        }
        if (firstname && firstname.trim() !== "") {
            updateObj.firstname = firstname
        }
        if (lastname && lastname.trim() !== "") {
            updateObj.lastname = lastname
        }
        if (country && country.trim() !== "") {
            updateObj.country = country
        }
        if (phone && phone.length == 11) {
            updateObj.phone = phone
        }
        try {
            let user = await Models.User.findOne({
                where: {
                    user_id: id
                },
                attributes: ["firstname", "lastname", "phone", "user_id", "country"]
            })

            if (user == null || user == undefined) {
                response = new BaseResponse(failureStatus, "User not found", failureCode, {})
                return res.status(400)
                    .send(response)
            }

            await user.update(updateObj)
            response = new BaseResponse(successStatus, successStatus, successCode, user)
            return res.status(200)
                .send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    passwordChange: ('/', async (req, res) => {
        let { id } = req.params
        let { password } = req.body
        if (password.trim() == "") {
            response = new BaseResponse(failureStatus, "Password is required", failureCode, {})
            return res.status(400)
                .send(response)
        }
        try {
            let user = await Models.User.findOne({
                where: {
                    user_id: id
                }
            })
            if (user == null || user == undefined) {
                response = new BaseResponse(failureStatus, "User not found", failureCode, {})
                return res.status(400)
                    .send(response)
            }

            if (user.password == bin2hashData(password, process.env.PASSWORD_HASH)) {
                response = new BaseResponse(failureStatus, "Can not use old password", failureCode, {})
                return res.status(400)
                    .send(response)
            }

            await user.update({
                password: bin2hashData(password, process.env.PASSWORD_HASH),
                access_token: null,
                refresh_token: null,
                token_expiry_date: null
            })

            response = new BaseResponse(successStatus, successStatus, successCode, "")
            return res.status(200)
                .send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    getAccount: ('/', async (req, res) => {
        let { id } = req.params
        try {
            let user = await Models.Members.findOne({
                where: {
                    user_id: id
                },
                attributes: ["bank_code", "account_name", "account_number", "bitcoin_wallet", "bank_name"]
            })
            response = new BaseResponse(successStatus, successStatus, successCode, user)
            return res.status(200)
                .send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    editAccount: ('/', async (req, res) => {
        let { id } = req.params
        let { accountName, accountNumber, bankName, bankCode, bitcoinWallet } = req.body;
        let response
        if (accountName.trim() == "" || accountNumber.trim() == "" || accountNumber.length != 10 || bankName.trim() == "" || bankCode.trim() == "" || bitcoinWallet.trim() == "") {
            response = new BaseResponse(failureStatus, "One or more parameters are invalid", failureCode, {})
            return res.status(400)
                .send(response)
        }
        try {
            let user = await Models.Members.findOne({
                where: {
                    user_id: id
                }
            })

            if (user == null || user == undefined) {
                response = new BaseResponse(failureStatus, "User not found", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            await user.update({
                account_name: accountName,
                account_number: accountNumber,
                bitcoin_wallet: bitcoinWallet,
                bank_name: bankName,
                bank_code: bankCode
            })
            response = new BaseResponse(successStatus, successStatus, successCode, {})
            return res.status(200)
                .send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    getTransactionPin: ('/', async (req, res) => {
        var ts = String(new Date().getTime())
        let response;
        let { id } = req.params
        try {
            let user = await Models.User.findOne({
                where: {
                    user_id: id
                }
            })
            if (user == null || user == undefined) {
                logger.error(error.toString())
                response = new BaseResponse(failureStatus, "User Not Found", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            await user.update({
                transaction_pin: bin2hashData(ts, process.env.PASSWORD_HASH)
            })
            mailService.dispatch(user.email, "Next Crypto", "Transaction Pin", `Your transaction pin is ${ts}. Kindly keep safe as you can not perform any transaction without it`, (err) => {
                if (err) {
                    logger.error(err.toString())
                    response = new BaseResponse(successStatus, `An Error occured while sending mail .Your transaction pin is ${ts}. Kindly keep safe as you can not perform any transaction without it`, successCode, {})
                    return res.status(200)
                        .send(response)
                } else {
                    response = new BaseResponse(successStatus, `Transaction Pin has been sent to your email`, successCode, {})
                    return res.status(200)
                        .send(response)
                }
            })
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    verifyTransactionPin: ('/', async (req, res) => {
        let response;
        let { id } = req.params
        let { pin } = req.body
        try {
            let user = await Models.User.findOne({
                where: {
                    user_id: id
                }
            })
            if (user == null || user == undefined) {
                logger.error(error.toString())
                response = new BaseResponse(failureStatus, "User Not Found", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            if (user.transaction_pin == bin2hashData(String(pin), process.env.PASSWORD_HASH)) {
                response = new BaseResponse(successStatus, successStatus, successCode, {})
                return res.status(200)
                    .send(response)
            } else {
                response = new BaseResponse(failureStatus, "Invalid Transaction Pin", failureCode, {})
                return res.status(400)
                    .send(response)
            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    getUsers: ('/', async (req, res) => {
        let { searchTerm } = req.params;
        let { offset } = req.query
        let response
        try {
            let users = await Models.User.findAndCountAll({
                where: {
                    [Op.or]: [{
                        email: {
                            [Op.like]: `%${searchTerm}%`
                        },
                    }, {
                        firstname: {
                            [Op.like]: `%${searchTerm}%`
                        }
                    },
                    {
                        lastname: {
                            [Op.like]: `%${searchTerm}%`
                        }
                    }]
                },
                attributes: ["user_id", "firstname", "lastname", "email", "phone", "country"],
                offset: offset ? Number(offset) : 0,
                limit: 10

            })
            response = new BaseResponse(successStatus, successStatus, successCode, users)
            return res.status(200)
                .send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    createInvestment: ('/', async (req, res) => {
        let { id } = req.params
        let { amount, dueDate } = req.body
        let date = convertDate(Date.now())
        let response
        if (Number(amount) < 1) {
            response = new BaseResponse(failureStatus, "Invalid Amount", failureCode, {})
            return res.status(400).send(response)
        }
        try {
            let userAccount = await Models.Account.findOne({
                where: {
                    user_id: id
                }
            })
            if (Number(userAccount.balance) == 0 || Number(userAccount.balance) < Number(amount)) {
                response = new BaseResponse(failureStatus, "Insufficient Balance", failureCode, {})
                return res.status(400).send(response)
            }
            let newInvestment = await Models.Investments.create({
                user_id: id,
                amount_invested: amount,
                current_amount: amount,
                total_profits: 0,
                date_created: date,
                due_date: convertDate(dueDate)
            })
            let newUserBalance = Number(userAccount.balance) - Number(amount);
            await userAccount.update({
                balance: newUserBalance
            })
            await createNotifications(id, `New Investment of $${amount} made`, date)
            response = new BaseResponse(successStatus, successStatus, successCode, {})
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    redeemInvestment: ('/', async (req, res) => {
        let date = convertDate(Date.now())
        let { id, investmentId } = req.params
        try {
            let investment = await Models.Investments.findOne({
                where: {
                    investment_id: investmentId
                }
            })

            if (investment == null || investment == undefined) {
                response = new BaseResponse(failureStatus, "Investment Not Found", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            if (String(investment.user_id) !== String(id)) {
                response = new BaseResponse(failureStatus, "Invalid User", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            if (moment.tz("Africa/Lagos").unix() < moment.tz(investment.due_date, "Africa/Lagos").unix()) {
                response = new BaseResponse(failureStatus, "Due Date Not Reached", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            if (investment.isRedeemed == true) {
                response = new BaseResponse(failureStatus, "Investment Already Redeemed", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            let userAccount = await Models.Account.findOne({
                where: {
                    user_id: id
                }
            })

            let newBalance = Number(investment.current_amount) + Number(userAccount.balance)
            await userAccount.update({
                balance: newBalance
            })
            await investment.update({
                date_updated: date,
                isRedeemed: true
            })
            await createNotifications(id, `Account Credit of $${investment.current_amount} from Redeemed investment`, date)
            response = new BaseResponse(successStatus, successStatus, successCode, {})
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),

    cancelInvestment: ('/', async (req, res) => {
        let date = convertDate(Date.now())
        let { id, investmentId } = req.params
        try {
            let investment = await Models.Investments.findOne({
                where: {
                    investment_id: investmentId
                }
            })

            if (investment == null || investment == undefined) {
                response = new BaseResponse(failureStatus, "Investment Not Found", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            if (String(investment.user_id) !== String(id)) {
                response = new BaseResponse(failureStatus, "Invalid User", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            if (investment.isRedeemed == true) {
                response = new BaseResponse(failureStatus, "Investment Already Redeemed", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            let userAccount = await Models.Account.findOne({
                where: {
                    user_id: id
                }
            })

            let newBalance = Number(investment.amount_invested) + Number(userAccount.balance)
            await userAccount.update({
                balance: newBalance
            })
            await investment.update({
                date_updated: date,
                isRedeemed: true
            })
            await createNotifications(id, `Account Credit of $${investment.amount_invested} from Canceled investment`, date)
            response = new BaseResponse(successStatus, successStatus, successCode, {})
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),

    getInvestments: ('/', async (req, res) => {
        let { id } = req.params
        let { amount, offset } = req.query
        let response
        let whereObj = {
        }
        if (!req.user.isAdmin) {
            whereObj.user_id = id
        }
        if (amount && amount !== "") {
            whereObj.amount_invested = amount
        }

        try {
            let allInvestments = await Models.Investments.findAndCountAll({
                where: whereObj,
                offset: offset ? Number(offset) : offset,
                limit: 10,
                order: [['investment_id', 'DESC']],
            })
            response = new BaseResponse(successStatus, successStatus, successCode, allInvestments)
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    fetchBalance: ('/', async (req, res) => {
        let { id } = req.params
        let response
        try {
            let userAccount = await Models.Account.findOne({
                where: {
                    user_id: id
                },
                attributes: ["balance"]
            })
            if (userAccount == null || userAccount == undefined) {
                response = new BaseResponse(failureStatus, "Account Not found", failureCode, {})
                return res.status(400)
                    .send(response)
            }

            response = new BaseResponse(successStatus, successStatus, successCode, userAccount)
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)

        }
    }),

    genrateWalletId: ('/', async (req, res) => {
        let { id } = req.params
        let { type } = req.query
        let response
        client.getAccount(type, function (err, accounts) {
            if (err) {
                response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                return res.status(400).send(response)
            }
            accounts.createAddress(null, async function (err, addr) {
                if (err) {
                    response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                    return res.status(400).send(response)
                }
                let foundUser = await Models.UserAddress.findAll({
                    where: {
                        user_id: id
                    }
                })
                let createNew = async () => {

                    let userAddress = await Models.UserAddress.create({
                        user_id: id,
                        wallet_address: addr.address,
                        date_created: convertDate(Date.now()),
                        currency: type
                    })
                }
                if (foundUser.length > 0) {
                    let usr
                    await foundUser.forEach(async (user, i) => {
                        if (user.currency == type) {
                            usr = user
                        } 
                    })
                    if(usr !== undefined && usr !== null){
                        await usr.update({
                            wallet_address: addr.address,
                            date_updated: convertDate(Date.now())
                        })
                    } else {
                        await createNew()
                    }
                } else {
                    await createNew()
                }
                let response = new BaseResponse(successStatus, successStatus, successCode, { walletAddress: addr.address })
                return res.status(200).send(response)

            });
        });
    })
}