const BaseResponse = require('../../helpers/ResponseClass')
const { convertDate, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Models = require('../../connection/sequelize')
var client = require('../../helpers/CoinBaseClient')

module.exports = {
    trade: ('/', async (req, res) => {
        let { amount, walletId, email, charges, paymentRef } = req.body
        if ( Number(amount) < 1000 || walletId.trim() == "" || email.trim() == "" || charges < 0 || paymentRef.trim() == "") {
            response = new BaseResponse(failureStatus, "One or more parameters are invalid", failureCode, {})
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
            if (Number(accounts.balance.amount) < 0.00001) {
                response = new BaseResponse(failureStatus, "Account Low, Kindly Top Up Bitcoin Wallet", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            let buyPrice, btcRate, nairaRate
            client.getBuyPrice({ 'currencyPair': 'BTC-NGN' }, (err, nairaInfo) => {
                if (err) {
                    logger.error(err.toString())
                    response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                    return res.status(400)
                        .send(response)
                }
                buyPrice = Number(amount) / Number(nairaInfo.data.amount)
                console.log(buyPrice, "buy price")

                accounts.sendMoney({
                    to: walletId,
                    amount: buyPrice.toFixed(7),
                    currency: 'BTC'
                }, async function (err, tx) {
                    if (err) {
                        logger.error(err.toString())
                        response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                        return res.status(400)
                            .send(response)
                    } else {
                        await Models.Trade.create({
                            currency: "BTC",
                            email: email,
                            amount: amount,
                            charges: charges,
                            payment_ref: paymentRef,
                            date: convertDate(Date.now())
                        })
                        response = new BaseResponse(successStatus, successStatus, successCode, "Transaction in successful")
                        return res.status(200)
                            .send(response)
                    }

                });
            });

        });
    }),
}