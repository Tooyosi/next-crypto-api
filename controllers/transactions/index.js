const uuid = require('uuid').v4
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Paystackcall = require('../../helpers/PaystackCallService')
let createNotifications = require('../../helpers/createNotification');
var client = require('../../helpers/CoinBaseClient')

module.exports = {
    getAll: ('/', async (req, res) => {
        let response;
        let { amount, reference, status, offset, date } = req.query
        let whereObj = {}
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
                        as: "details",
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
    approve: ('/', async (req, res) => {
        let { id } = req.params
        let { action } = req.body
        let apicall = new Paystackcall()
        try {
            let transaction = await Models.Transactions.findOne({
                where: {
                    transaction_id: id
                }
            })
            if (transaction == null || transaction == undefined) {
                response = new BaseResponse(failureStatus, "Transaction not found", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            if (action == "approve") {
                let memberDetails = await Models.Members.findOne({
                    where: {
                        user_id: transaction.user_id
                    },
                    attributes: ["account_name", "account_number", "bitcoin_wallet", "bank_name", "bank_code", "account_id"]
                })

                let memberAccount = await Models.Account.findOne({
                    where: {
                        account_id: memberDetails.account_id
                    }
                })

                let withdrawer = await Models.User.findOne({
                    where: {
                        user_id: transaction.user_id
                    },
                    attributes: ["email"]

                })
                if (Number(memberAccount.balance) < Number(transaction.amount)) {
                    response = new BaseResponse(failureStatus, "Insufficient Balance", failureCode, {})
                    return res.status(400)
                        .send(response)
                }
                if (transaction.currency == "Naira" && transaction.transaction_type == "Withdrawal" && transaction.transaction_status == "pending") {
                    if (memberDetails.account_name == null || memberDetails.account_number == null || memberDetails.bank_name == null || memberDetails.bank_code == null) {
                        response = new BaseResponse(failureStatus, "Incomplete User Account Information", failureCode, {})
                        return res.status(400)
                            .send(response)
                    }
                    let exChangeRate = await apicall.makeCall("GET", "https://free.currconv.com/api/v7/convert?q=NGN_USD&compact=ultra&apiKey=8b45b064c092a5a04138")
                    let newAmt
                    if(exChangeRate.status){
                        newAmt = Number(transaction.amount) / exChangeRate.response.NGN_USD
                    }else{
                        newAmt = Number(transaction.amount) * 356

                    }
                    let transferReciept = await apicall.makeCall("POST", `https://api.paystack.co/transferrecipient`, {
                        type: "nuban",
                        name: memberDetails.account_name,
                        description: `${withdrawer.email}'s cash withdrawal`,
                        account_number: memberDetails.account_number,
                        bank_code: memberDetails.bank_code,
                        currency: "NGN",
                    })

                    
                    let transfer = await apicall.makeCall("POST", `https://api.paystack.co/transfer`, { source: "balance", reason: `${withdrawer.email}'s cash withdrawal`, amount: (Number(newAmt) * 100), recipient: `${transferReciept.response.data.recipient_code}` })
                    if (transfer.status) {
                        await transaction.update({
                            transaction_status: transfer.response.data.status
                        })
                        let newBalance = Number(memberAccount.balance) - Number(transaction.amount)
                        await memberAccount.update({
                            balance: newBalance,
                            date_updated: dateTime
                        })
                        await createNotifications(transaction.user_id, `Withdrawal request with reference ${transaction.transaction_reference} has been approved.`, dateTime)
                        response = new BaseResponse(successStatus, successStatus, successCode, transfer.response.message)
                        return res.status(200)
                            .send(response)
                    } else {
                        response = new BaseResponse(failureStatus, failureStatus, failureCode, transfer.response)
                        return res.status(200)
                            .send(response)
                    }

                } else if (transaction.currency == "Bitcoin" && transaction.transaction_type == "Withdrawal" && transaction.transaction_status == "pending") {
                    if (memberDetails.bitcoin_wallet == null) {
                        response = new BaseResponse(failureStatus, "Incomplete User Account Information: No BTC Wallet", failureCode, {})
                        return res.status(400)
                            .send(response)
                    }
                    client.getAccount("primary", function (err, accounts) {
                        // accounts.forEach(function(acct) {
                        if (err) {
                            logger.error(err.toString())
                            response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                            return res.status(400)
                                .send(response)
                        }
                        if (Number(accounts.balance.amount) < 1) {
                            response = new BaseResponse(failureStatus, "Account Low, Kindly Top Up Bitcoin Wallet", failureCode, {})
                            return res.status(400)
                                .send(response)
                        }
                        let buyPrice, btcRate
                        client.getBuyPrice({ 'currencyPair': 'BTC-USD' }, (err, info) => {
                            console.log(`Buy Price: ${info.data.amount}`);

                            btcRate = 1 / info.data.amount

                            let processingFee = 0.000001
                            let withdrawAmt = btcRate - processingFee
                            buyPrice = Number(transaction.amount) * btcRate
                            console.log(btcRate, withdrawAmt)
                            accounts.createAddress(null, function (err, addr) {
                                // console.log(addr.address);
                                accounts.sendMoney({
                                    to: memberDetails.bitcoin_wallet,
                                    amount: buyPrice,
                                    currency: 'BTC'
                                }, async function (err, tx) {
                                    if (err) {
                                        logger.error(err.toString())
                                        response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                                        return res.status(400)
                                            .send(response)
                                    } else {
                                        await transaction.update({
                                            transaction_status: "successful"
                                        })
                                        response = new BaseResponse(successStatus, successStatus, successCode, "Successful")
                                        return res.status(200)
                                            .send(response)
                                    }

                                });
                            });
                        });
                    });
                } else {
                    response = new BaseResponse(failureStatus, "Invalid Action", failureCode, {})
                    return res.status(400)
                        .send(response)
                }
            } else if(action == "decline"){
                await transaction.update({
                    transaction_status: "declined",
                })
                response = new BaseResponse(successStatus, successStatus, successCode, {})
                return res.status(200)
                    .send(response)
            }else {
                response = new BaseResponse(failureStatus, "Invalid Action", failureCode, {})
                return res.status(400)
                    .send(response)
            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    })
}