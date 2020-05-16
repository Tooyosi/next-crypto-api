const { convertDate } = require('./index')
const Models = require('../connection/sequelize')
const moment = require('moment-timezone')
const Mailer = require('./SendMail')
const sendMail = new Mailer()
module.exports = async () => {
    try {

        let investments = await Models.Investments.findAll()
        investments.forEach(async (investment) => {

            if (!investment.isRedeemed && !investment.isCanceled) {
                let initialDay = new Date(investment.date_created)
                let today = new Date()

                const monthDifference =
                    (today.getFullYear() - initialDay.getFullYear()) * 12 +
                    (today.getMonth() - initialDay.getMonth());

                let percent = (10/100) * Number(investment.amount_invested)
                if (moment.tz("Africa/Lagos").unix() > moment.tz(investment.due_date, "Africa/Lagos").unix()) {
                    if (investment.isNotificationSent !== true) {
                        let user = await Models.User.findOne({
                            where: {
                                user_id: investment.user_id
                            }
                        })


                        let userAccount = await Models.Account.findOne({
                            where: {
                                user_id: investment.user_id
                            }
                        })

                        let newBalance = Number(userAccount.balance) + Number(investment.current_amount)
                        await userAccount.update({
                            balance: newBalance,
                            date_updated: convertDate(Date.now())
                        })
                        sendMail.dispatch(user.email, "Next Crypto", "Due Investment", `Congratulations, Your investment of ${investment.amount_invested} btc has been redeemed and you've received a total of ${investment.current_amount} btc`, async (err) => {
                            await investment.update({
                                isRedeemed: true
                            })
                        })
                    }

                } else {
                    if (investment.date_updated == null) {
                        if(monthDifference > 0){
                            let newProfit = Number(investment.total_profits) + Number(percent.toFixed(6))
                            let newCurrentAmount = Number(investment.current_amount) + Number(percent.toFixed(6))
                            await investment.update({
                                current_amount: newCurrentAmount,
                                total_profits: newProfit,
                                date_updated: convertDate(Date.now())
                            })  
                        }

                    } else {
                        let updatedDate = new Date(investment.date_updated)
                        const updatedDifference =
                            (today.getFullYear() - updatedDate.getFullYear()) * 12 +
                            (today.getMonth() - updatedDate.getMonth());
                        if(updatedDifference > 0){
                            let newProfit = Number(investment.total_profits) + Number(percent.toFixed(6))
                            let newCurrentAmount = Number(investment.current_amount) + Number(percent.toFixed(6))
                            await investment.update({
                                current_amount: newCurrentAmount,
                                total_profits: newProfit,
                                date_updated: convertDate(Date.now())
                            }) 

                        }
                    }

                }
            }
        });
    } catch (error) {
        console.log(error)
    }
}