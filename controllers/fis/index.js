const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Paystackcall = require('../../helpers/PaystackCallService')
var client = require('../../helpers/CoinBaseClient')

module.exports = {
    loadFis: ('/', async(req, res)=>{
        let apicall = new Paystackcall()
        let result = await apicall.makeCall("GET", `https://api.paystack.co/bank`)
        let {status, response} = result
        let sendResponse = new BaseResponse(status? successStatus: failureStatus, status? successStatus : failureStatus, status? successCode : failureCode, response)
        return res.status(status ? 200 : 400).send(sendResponse)
    }),

    btcConvert: ('/', async(req, res)=>{
        let {btc, naira} = req.body
        let response
        if(btc.trim() == "" && naira.trim() == ""){
            response = new BaseResponse(failureStatus, validationErrorMessage, failureCode,{} )
            return res.status(400).send(response)
        }
        client.getBuyPrice({'currencyPair': 'BTC-NGN'}, (err, info) => {
            if(err){
                response = new BaseResponse(failureStatus, err.toString(), failureCode,{} )
                return res.status(400).send(response)
            }
            if(btc.trim() !== ""){
                let btcValue = (info.data.amount * Number(btc))
                let response = new BaseResponse(successStatus, successStatus, successCode, {btc: btc, naira: btcValue})
                return res.status(200).send(response)
            }else if(naira.trim() !== ""){
                let amt = Number(naira)/info.data.amount
                let response = new BaseResponse(successStatus, successStatus, successCode, {btc: amt.toPrecision(), naira: naira})
                return res.status(200).send(response)
            }
        });
        
    })
}