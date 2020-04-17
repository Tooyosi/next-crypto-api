const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Paystackcall = require('../../helpers/PaystackCallService')

module.exports = {
    loadFis: ('/', async(req, res)=>{
        console.log("here")
        let apicall = new Paystackcall()
        let result = await apicall.makeCall("GET", `https://api.paystack.co/bank`)
        let {status, response} = result
        let sendResponse = new BaseResponse(status? successStatus: failureStatus, status? successStatus : failureStatus, status? successCode : failureCode, response)
        return res.status(status ? 200 : 400).send(sendResponse)
    })
}