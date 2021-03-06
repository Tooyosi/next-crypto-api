const uuid = require('uuid').v4
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { convertDate, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Paystackcall = require('../../helpers/PaystackCallService')
let createNotifications = require('../../helpers/createNotification');
var client = require('../../helpers/CoinBaseClient')
// Not using this file anywhere, but scared of deleting
module.exports = {
    post: ('/', async (req, res) => {
        let response
        let { name, phone, username, address, city, state, country, nationality, acctName, bankName, email, acctNumber, acctType, amount, duration, paymentReference,  refCode } = req.body
        if (name.trim() == "" || phone.trim() == "" || username.trim() == "" || address.trim() == "" || city.trim() == "" || state.trim() == "" || country.trim() == "" || nationality.trim() == "" || acctName.trim() == "" || email.trim() == "" || bankName.trim() == "" || acctNumber.trim() == "" || acctType.trim() == "" || amount == "" || duration < 1 || paymentReference.trim() == "") {
            response = new BaseResponse(failureStatus, "One or more fields are empty", failureCode, {})
            return res.status(400)
                .send(response)
        }
        console.log(refCode)
        try {
            let members = await Models.Members.findOne({
                where: {
                    referral_id: refCode
                }
            })
            let newInvestment = await Models.ExternalInvestment.create({
                name: name,
                phone: phone,
                username: username,
                address: address,
                city: city,
                state: state,
                country: country,
                nationality: nationality,
                account_name: acctName,
                account_number: acctNumber,
                bank_name: bankName,
                amount_invested: Number(amount),
                investment_duration: duration,
                payment_ref: paymentReference,
                email: email,
                isRedeemed: false,
                account_type: acctType,
                date_created: convertDate(Date.now()),
                referralBank: members !== null && members !== undefined ? members.bank_name : null,
                referralAccount: members !== null && members !== undefined ? members.account_number : null,
                referralName: members !== null && members !== undefined ? members.account_name : null
            })

            response = new BaseResponse(successStatus, "Successful", successCode, {})
            return res.status(200)
                .send(response)

        } catch (error) {
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),

    put: ('/', async (req, res) => {
        let { id } = req.params
        let response
        try {
            let investment = await Models.ExternalInvestment.findOne({
                where: {
                    investment_id: id
                }
            })

            if (investment !== null && investment !== undefined) {
                await investment.update({
                    isRedeemed: true,
                    date_updated: convertDate(Date.now())
                })
                response = new BaseResponse(successStatus, "Investment successfully redeemed", successCode, {})
                return res.status(200)
                    .send(response)
            } else {

                response = new BaseResponse(failureStatus, "Investment does not exist", failureCode, {})
                return res.status(400)
                    .send(response)
            }
        } catch (error) {
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
    get: ('/', async (req, res) => {
        let { amount, offset, email } = req.query
        let response
        let whereObj = {
        }
        if (amount && amount !== "") {
            whereObj.amount_invested = amount
        }

        if (email && email !== "") {
            whereObj.email = email
        }

        try {
            let allInvestments = await Models.ExternalInvestment.findAndCountAll({
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