const BaseResponse = require('../../helpers/ResponseClass')
const { convertDate, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Models = require('../../connection/sequelize')
var client = require('../../helpers/CoinBaseClient')
const fetchCurrency = require('../../helpers/getCurrencyById')
const multer = require("multer")
const uuid = require('uuid').v4
const uploadFunction = require('../../helpers/multer')
const upload = uploadFunction('./uploads/payment')
var uploader = upload.single('proof')
module.exports = {
    trade: ('/', async (req, res) => {
        let { amount, walletId, email, charges, paymentRef, currencyId } = req.body
        let response
        if (walletId.trim() == "" || email.trim() == "" || charges < 0 || paymentRef.trim() == "" || currencyId == "") {
            response = new BaseResponse(failureStatus, "One or more parameters are invalid", failureCode, {})
            return res.status(400)
                .send(response)
        }
        let currenctDetails = await fetchCurrency(currencyId)
        if (currenctDetails !== null && currenctDetails !== undefined) {
            await Models.Trade.create({
                currency: currenctDetails.alias,
                email: email,
                amount: amount,
                charges: charges,
                wallet: walletId,
                payment_ref: paymentRef,
                date: convertDate(Date.now())
            })
            response = new BaseResponse(successStatus, successStatus, successCode, "Transaction in successful")
            return res.status(200)
                .send(response)
            // client.getAccount(currenctDetails.alias, function (err, accounts) {
            //     // accounts.forEach(function(acct) {
            //     if (err) {
            //         logger.error(err.toString())
            //         response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
            //         return res.status(400)
            //             .send(response)
            //     }
            //     if (Number(accounts.balance.amount) < 0.00001) {
            //         response = new BaseResponse(failureStatus, `Account Low, Kindly Top Up ${currenctDetails.name} Wallet`, failureCode, {})
            //         return res.status(400)
            //             .send(response)
            //     }
            //     let buyPrice, btcRate, nairaRate
            //     client.getBuyPrice({ 'currencyPair': `${currenctDetails.alias}-NGN` }, (err, nairaInfo) => {
            //         if (err) {
            //             logger.error(err.toString())
            //             response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
            //             return res.status(400)
            //                 .send(response)
            //         }
            //         buyPrice = Number(amount) / Number(nairaInfo.data.amount)

            //         accounts.sendMoney({
            //             to: walletId,
            //             amount: buyPrice.toFixed(7),
            //             currency: currenctDetails.alias
            //         }, async function (err, tx) {
            //             if (err) {
            //                 logger.error(err.toString())
            //                 response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
            //                 return res.status(400)
            //                     .send(response)
            //             } else {
            //                 await Models.Trade.create({
            //                     currency: currenctDetails.alias,
            //                     email: email,
            //                     amount: amount,
            //                     charges: charges,
            //                     payment_ref: paymentRef,
            //                     date: convertDate(Date.now())
            //                 })
            //                 response = new BaseResponse(successStatus, successStatus, successCode, "Transaction in successful")
            //                 return res.status(200)
            //                     .send(response)
            //             }

            //         });
            //     });

            // });
        }
    }),
    get: ('/', async (req, res) => {
        let response
        let { offset } = req.query
        try {
            let allTrades = await Models.Trade.findAndCountAll({
                offset: offset ? Number(offset) : offset,
                limit: 10,
                order: [['id', 'DESC']],
            })
            response = new BaseResponse(successStatus, successStatus, successCode, allTrades)
            return res.status(200).send(response)

        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)

        }
    }),

    sale: ('/', async (req, res) => {
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
            } else if ((req.file == null || req.file == undefined)) {
                response = new BaseResponse(failureStatus, "Missing File Attachment", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            else {
                let {
                    account_number,
                    account_name,
                    bank_name,
                    bank_code,
                    amount,
                    crypto_value,
                    currency
                } = req.body
                let response
                if (account_number.trim() == "" || account_name.trim() == ""
                    || bank_name.trim() == ""
                    || bank_code.trim() == ""
                    || amount.trim() == ""
                    || crypto_value.trim() == ""
                    || currency.trim() == "") {
                    response = new BaseResponse(failureStatus, "One or more parameters are invalid", failureCode, {})
                    return res.status(400)
                        .send(response)
                }

                try {
                    let newSale = await Models.CryptoSale.create({
                        account_number: account_number,
                        account_name: account_name,
                        bank_name: bank_name,
                        bank_code: bank_code,
                        payment_reference: uuid(),
                        proof_of_payment: req.file.path,
                        status: "Pending",
                        amount: amount,
                        crypto_value: crypto_value,
                        currency: currency,
                        date_created: convertDate(Date.now())
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
            }
        })
    }),
    getSales: ('/', async (req, res) => {
        let response
        let { offset } = req.query
        try {
            let allTrades = await Models.CryptoSale.findAndCountAll({
                offset: offset ? Number(offset) : offset,
                limit: 10,
                order: [['sale_id', 'DESC']],
            })
            response = new BaseResponse(successStatus, successStatus, successCode, allTrades)
            return res.status(200).send(response)

        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)

        }
    }),

    confirmSale: ('/', async (req, res) => {
        let { id } = req.params
        // let { action } = req.body
        let response

        try {
            let foundSale = await Models.CryptoSale.findOne({
                where: {
                    sale_id: id
                }
            })

            if (foundSale == null || foundSale == undefined) {
                response = new BaseResponse(failureStatus, "No Sale found", failureCode, {})
                return res.status(400)
                    .send(response)
            }

            await foundSale.update({
                status: "Confirmed",
                date_approved: convertDate(Date.now())
            })
            response = new BaseResponse(successStatus, successStatus, successCode, {})
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    })
}