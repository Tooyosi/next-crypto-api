const expressJwt = require('express-jwt');
const authenticate = expressJwt({ secret: process.env.SESSION_SECRET });
const BaseResponse = require('../helpers/ResponseClass')
const { logger } = require('../loggers/logger')
const { failureCode, failureStatus, addMinutes, convertDate, dateTime } = require('../helpers/index')
const models = require('../connection/sequelize')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')


module.exports = {
    protected: async (err, req, res, next) => {
        if (err.name === 'UnauthorizedError') {
            let response = new BaseResponse(false, err.message? err.message.toString() : 'Invalid Token', failureCode, {})
            res.status(401).send(response);
        } else {

            // next()
        }
    },

    isAdmin: async (req, res, next) => {
        if(!req.user.isAdmin){
            let response = new BaseResponse(false, 'Invalid Operation, You need to be an admin to perform this operation', failureCode, {})
            res.status(401).send(response);
        }else{
            next()
        }
    },
    refresh: async (req, res, next) => {
        try {
            let sessionUser = await models.User.findOne({
                where: {
                    user_id: req.user.id
                }
            })
            let { dataValues } = sessionUser
            let expirtDate = convertDate(dataValues.token_expiry_date)
            let now = new Date(dateTime).getTime()
            let dateExpired = new Date(expirtDate).getTime();
            let {authorization} = req.headers
            let incomingToken = authorization.replace('Bearer ', '')
            if (now > dateExpired || incomingToken !== sessionUser.access_token) {
                let response = new BaseResponse(false, 'Invalid Token', failureCode, {})
                return res.status(401).send(response);
            } else {
                next()
            }
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(false, error.toString(), failureCode, {})
            return res.status(400).json(response)

        }
    },

    isLoggedUser: async(req, res, next)=>{
        let {id} = req.params
        if(req.user.id != id){
            response = new BaseResponse(failureStatus, "Invalid User", failureCode, {})
            return res.status(400)
                .send(response)
        }
        next()
    }
}