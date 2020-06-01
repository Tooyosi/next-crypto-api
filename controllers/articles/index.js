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
        let { name, contents, description } = req.body
        if (name.trim() == "" || contents.trim() == "") {
            response = new BaseResponse(failureStatus, "One or more fields are empty", failureCode, {})
            return res.status(400)
                .send(response)
        }

        try {
            let newArticle = await Models.Articles.create({
                name: name,
                description: description,
                contents: contents,
                date_created: convertDate(Date.now())
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
        let { contents, name, description} = req.body
        let uploadObj = {}
        if (contents && contents !== "") {
            uploadObj.contents = contents
        }
        if (name && name !== "") {
            uploadObj.name = name
        }
        if (description && description !== "") {
            uploadObj.description = description
        }
        let response
        try {
            let article = await Models.Articles.findOne({
                where: {
                    article_id: id
                }
            })

            if (article !== null && article !== undefined) {
                if (Object.keys(uploadObj).length > 0) {
                    uploadObj.date_updated = convertDate(Date.now())
                }
                await article.update(uploadObj)
                response = new BaseResponse(successStatus, "Successful", successCode, {})
                return res.status(200)
                    .send(response)
            } else {

                response = new BaseResponse(failureStatus, "Article does not exist", failureCode, {})
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
            let allArticles = await Models.Articles.findAndCountAll({
                where: whereObj,
                offset: offset ? Number(offset) : offset,
                limit: 10,
                order: [['article_id', 'DESC']],
            })
            response = new BaseResponse(successStatus, successStatus, successCode, allArticles)
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),

    getSingle: ('/', async (req, res) => {

        let { id } = req.params

        try {
            let article = await Models.Articles.findOne({
                where: {
                    article_id: id
                }
            })
            if (article == null || article == undefined) {
                response = new BaseResponse(failureStatus, "Article does not exist", failureCode, {})
                return res.status(400)
                    .send(response)
            }
            response = new BaseResponse(successStatus, successStatus, successCode, article)
            return res.status(200).send(response)
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)
        }
    }),
}