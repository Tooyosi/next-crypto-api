const uuid = require('uuid').v4
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
let Paystackcall = require('../../helpers/PaystackCallService')
let createNotifications = require('../../helpers/createNotification');
var client = require('../../helpers/CoinBaseClient')
let { Op } = require('sequelize')
const SendMail = require('../../helpers/SendMail')
let mailService = new SendMail("Gmail");

module.exports = {
    getAllUsers: ('/', async (req, res) => {
        let response;
        let { searchTerm, offset } = req.query
        let whereObj = {
            user_type_id: 1
        }
        if (searchTerm !== "" && searchTerm !== null && searchTerm !== undefined) {
            whereObj = {
                [Op.or]: [{
                    firstname: {
                        [Op.like]: `%${searchTerm}%`
                    },
                }, {
                    lastname: {
                        [Op.like]: `%${searchTerm}%`
                    }
                },
                {
                    email: {
                        [Op.like]: `%${searchTerm}%`
                    }
                },
                {
                    phone: {
                        [Op.like]: `%${searchTerm}%`
                    }
                }],
                user_type_id: 1


            }
        }
        try {
            let allUsers = await Models.User.findAndCountAll({
                where: whereObj,
                attributes: ["user_id", "firstname", "lastname", "email", "phone", "date_created", "payment_proof", "isApproved"],
                offset: offset ? Number(offset) : offset,
                limit: 10,
                order: [['user_id', 'DESC']],
            })
            response = new BaseResponse(successStatus, successStatus, successCode, allUsers)
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
        try {
            let user = await Models.User.findOne({
                where: {
                    user_id: id
                }
            })
            let isApproved
            if (action == "approve") {
                isApproved = true
            } else {
                isApproved = false
            }

            if (user == null || user == undefined) {
                response = new BaseResponse(failureStatus, "User not found", failureCode, {})
                return res.status(404)
                    .send(response)
            }
            await user.update({
                isActivated: isApproved,
                isApproved: isApproved
            })
            if (action == "approve") {
                mailService.dispatch(user.dataValues.email, "Next Crypto", "Account Approved", "Congratulations, Your Next Crypto Account has been approved and activated. Kindly proceed to login", (err) => {

                })
            }
            response = new BaseResponse(successStatus, successStatus, successCode, {})
            return res.status(200)
                .send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    })
}