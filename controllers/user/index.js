const express = require("express");
const uuid = require('uuid').v4
const router = express.Router({ mergeParams: true })
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData, convertDate } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
const SendMail = require('../../helpers/SendMail')
let getAncestors = require('../../helpers/getAncestors')
let getIncompleteDownlines = require('../../helpers/getIncompleteDownline')
let mailService = new SendMail("Gmail");
const updateAccount = require('../../helpers/updateAccount')
const Op = require('sequelize').Op
let createNotifications = require('../../helpers/createNotification');
const moment = require('moment-timezone');
module.exports = {
    signup: ('/', async (req, res) => {
        let { firstname, lastname, email, country, uplineReferralCode, phone, password, isAdmin, paystackReference } = req.body
        var ts = String(new Date().getTime())
        let response, memberUplineId
        if (firstname.trim() == "" || lastname.trim() == "" || !validator(email) || country.trim() == "" || password.trim() == "") {
            response = new BaseResponse(failureStatus, validationErrorMessage, failureCode, {})
            return res.status(400)
                .send(response)
        } if (paystackReference.trim() == "") {
            response = new BaseResponse(failureStatus, "No payment made", failureCode, {})
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
            if (uplineMember !== null && uplineMember !== undefined) {
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
                payment_reference: paystackReference
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
                    upline_user_id: memberUplineId !== null && memberUplineId !== undefined ? memberUplineId.user_id : null,
                    parentId: memberUplineId !== null && memberUplineId !== undefined ? memberUplineId.member_id : null,
                    current_stage: 1,
                    referral_id: uuid(),
                    sponsor_id: uplineMember ? uplineMember.user_id : null,
                    account_id: newAccount.account_id,
                    parentMember_id: memberUplineId !== null && memberUplineId !== undefined ? memberUplineId.member_id : null,
                })

                await getAncestors(newUser.dataValues.user_id)
                console.log("here")
            } else {
                newMember = await Models.Admin.create({
                    user_id: newUser.dataValues.user_id,
                    referral_id: `${email}${newUser.dataValues.user_id}`,
                    account_id: newAccount.account_id
                })
            }

            mailService.dispatch(email, "Next Crypto", "Registeration Successful", '<p>Next Crypto Registration Successful. kindly visit <a href="http://' + req.headers.host + '/user/' + newUser.dataValues.user_id + '/activate">this Link</a> to activate your account<p>', (err) => {
                if (err) {
                    // logger.error(err)
                    response = new BaseResponse(successStatus, successStatus, successCode, `Welcome ${firstname}, kindly visit http://${req.headers.host}/user/${newUser.dataValues.user_id}/activate to activate your account`)

                } else {
                    response = new BaseResponse(successStatus, successStatus, successCode, `Welcome ${firstname}, we have sent an activation link to your email ${email}. Please click the link to verify your email address and activate your Next crypto account`)
                } return res.status(200).send(response)
            })
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }

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
            date: dateTime,
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
                let update = await updateAccount(userAccount, newAmt, dateTime)
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

    transfer: ('/', async (req, res) => {
        let { id } = req.params
        let { recepientId, amount } = req.body
        let response;
        if (amount < 0) {
            console.log(req.user.id, id)
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
        let { firstname, lastname, phone } = req.body
        let updateObj = {
            date_updated: dateTime
        }
        if (firstname.trim() == "" && lastname.trim() == "" && phone.trim() == "") {
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
        if (phone && phone.length == 11) {
            updateObj.phone = phone
        }
        try {
            let user = await Models.User.findOne({
                where: {
                    user_id: id
                },
                attributes: ["firstname", "lastname", "phone", "user_id"]
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
                offset: Number(offset),
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
    })
}