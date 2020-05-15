const BaseResponse = require('../../helpers/ResponseClass')
const { convertDate, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Paystackcall = require('../../helpers/PaystackCallService')
var client = require('../../helpers/CoinBaseClient')
const { rateFn } = require('../../helpers/CurrencyConverter')
const Models = require('../../connection/sequelize')
const SendMail = require('../../helpers/SendMail')
let mailService = new SendMail("Gmail");
let createNotifications = require('../../helpers/createNotification');

module.exports = {
    notify: ('/', async (req, res) => {
        let { type, data: { address }, additional_data: { amount: { amount, currency } }, } = req.body
        switch (type) {
            case "wallet:addresses:new-payment":
                let account = await Models.UserAddress.findOne({
                    where: {
                        wallet_address: address,
                        currency: currency
                    }
                })
                if (account !== null && account !== undefined) {
                    let userAccount = await Models.Account.findOne({
                        where: {
                            user_id: account.user_id
                        }
                    })
                    let newBalance = Number(userAccount.balance) + Number(amount)
                    await userAccount.update({
                        balance: newBalance,
                        date_updated: convertDate(Date.now())
                    })
                    let user = await Models.User.findOne({
                        where: {
                            user_id: account.user_id
                        }
                    })

                    mailService.dispatch(user.dataValues.email, "Next Crypto", `Recieved ${amount} ${currency}`, `You have just recieved ${amount}${currency} and it has been added to your balance`, (err) => {
                        

                    })

                    await createNotifications(account.user_id,`Recieved ${amount} ${currency} from an external wallet. New balance is ${newBalance}`,  convertDate(Date.now()) )
                }
                break;
        }
        
        return res.status(200).send("success")
    }),



}