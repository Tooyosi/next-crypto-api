const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Paystackcall = require('../../helpers/PaystackCallService')
var client = require('../../helpers/CoinBaseClient')
const { rateFn } = require('../../helpers/CurrencyConverter')
const Models = require('../../connection/sequelize')
const findCurrency = require('../../helpers/getCurrencyById');
const getFee = require('../../helpers/getFeeByAmount');
var WAValidator = require('wallet-address-validator');
module.exports = {
    loadFis: ('/', async (req, res) => {
        let apicall = new Paystackcall()
        let result = await apicall.makeCall("GET", `https://api.paystack.co/bank`)
        let { status, response } = result
        let sendResponse = new BaseResponse(status ? successStatus : failureStatus, status ? successStatus : failureStatus, status ? successCode : failureCode, response)
        return res.status(status ? 200 : 400).send(sendResponse)
    }),
    loadCurrencies: ('/', async (req, res) => {
        let response
        try {
            let currencies = await Models.Currencies.findAll({})
            let sendResponse = new BaseResponse(successStatus, successStatus, successCode, currencies)
            return res.status(200).send(sendResponse)
        } catch (error) {
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }

    }),
    btcConvert: ('/', async (req, res) => {
        let { btc, naira, walletAddress, currencyId } = req.body
        let response, currencyDetails, fee, newFee, deductedRate
        if (btc.trim() == "" && naira.trim() == "") {
            response = new BaseResponse(failureStatus, validationErrorMessage, failureCode, {})
            return res.status(400).send(response)
        }
        if (walletAddress && walletAddress.trim() == "") {
            response = new BaseResponse(failureStatus, validationErrorMessage, failureCode, {})
            return res.status(400).send(response)
        } else if (walletAddress) {
            fee = await getFee(Number(naira))
            if (currencyId == "") {
                response = new BaseResponse(failureStatus, validationErrorMessage, failureCode, {})
                return res.status(400).send(response)
            }
            // if fro, trade frm call
            currencyDetails = await findCurrency(currencyId)
            let isValid = WAValidator.validate(walletAddress, currencyDetails.alias);
            if (isValid == false) {
                response = new BaseResponse(failureStatus, `Input a valid ${currencyDetails.name} address`, failureCode, {})
                return res.status(400).send(response)
            }
        }
        // if not from trade form call
        if (currencyId && currencyId !== "") {
            currencyDetails = await findCurrency(currencyId)
        }
        if (req.query.fee && req.query.fee !== "") {
            fee = await getFee(Number(naira))
        }
        client.getBuyPrice({ 'currencyPair': currencyDetails ? `${currencyDetails.alias}-NGN` : `BTC-NGN` }, async (err, info) => {
            if (err) {
                response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                return res.status(400).send(response)
            }

            if (btc.trim() !== "") {
                let btcValue = (Number(info.data.amount) * Number(btc))
                let response = new BaseResponse(successStatus, successStatus, successCode, { btc: btc, naira: btcValue, fee: fee ? fee.value : null })
                return res.status(200).send(response)
            } else if (naira.trim() !== "") {
                let amt
                if (fee) {
                    let feerate = Number(fee.value) / 100
                    newFee = Number(naira) * feerate
                    deductedRate = newFee / Number(info.data.amount)
                    let newNaira = Number(naira) - newFee
                    amt = newNaira / Number(info.data.amount)
                } else {
                    amt = Number(naira) / Number(info.data.amount)
                }
                let response = new BaseResponse(successStatus, successStatus, successCode, { btc: amt.toPrecision(), naira: naira, fee: fee ? fee.value : null, deductedFee: deductedRate ? deductedRate.toFixed(6) : null })
                return res.status(200).send(response)
            }
        });

    }),
    getWallet: ('/', async (req, res) => {
        let { type } = req.query
        let response
        client.getAccount(type, function (err, accounts) {
            if (err) {
                response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                return res.status(400).send(response)
            }
            accounts.createAddress(null, function (err, addr) {
                if (err) {
                    response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                    return res.status(400).send(response)
                }
                let response = new BaseResponse(successStatus, successStatus, successCode, { walletAddress: addr.address })
                return res.status(200).send(response)

            });
        });
    }),
    exchangeRate: ('/', async (req, res) => {
        client.getExchangeRates({}, function (err, price) {
            if (err) {
                response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                return res.status(400).send(response)
            }
            
            if (price.data && price.data.rates && price.data.rates.NGN !== "") {
                let rate = 1/Number(price.data.rates.NGN)
                let response = new BaseResponse(successStatus, successStatus, successCode, { exchangeRate: rate })
                return res.status(200).send(response)
            }
            client.getBuyPrice({ 'currencyPair': 'BTC-NGN' }, async (err, info) => {
                let nairaValue, dollarValue
                if (err) {
                    response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                    return res.status(400).send(response)
                }
                nairaValue = Number(info.data.amount)

                client.getBuyPrice({ 'currencyPair': 'BTC-USD' }, (err, dollar) => {
                    if (err) {
                        response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                        return res.status(400).send(response)
                    }
                    dollarValue = Number(dollar.data.amount)
                    let exRate = dollarValue / nairaValue
                    let response = new BaseResponse(successStatus, successStatus, successCode, { exchangeRate: exRate })
                    return res.status(200).send(response)
                })
            });
        });

    }),
    getNairaRates: ('/', async(req, res)=>{
        client.getBuyPrice({ 'currencyPair': 'BTC-NGN' }, async (err, btc) => {
            let btcValue, ethValue, response
            if (err) {
                response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                return res.status(400).send(response)
            }
            btcValue = Number(btc.data.amount)

            client.getBuyPrice({ 'currencyPair': 'ETH-NGN' }, (err, eth) => {
                if (err) {
                    response = new BaseResponse(failureStatus, err.toString(), failureCode, {})
                    return res.status(400).send(response)
                }
                ethValue = Number(eth.data.amount)
                response = new BaseResponse(successStatus, successStatus, successCode, { btcValue, ethValue })
                return res.status(200).send(response)
            })
        });
    })
}