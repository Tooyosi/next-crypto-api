const express = require("express");
const uuid = require('uuid').v4
const router = express.Router({ mergeParams: true })
const Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { dateTime, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
const SendMail = require('../../helpers/SendMail')
let getDownlines = require('../../helpers/getDownlines')
let getIncompleteDownlines = require('../../helpers/getIncompleteDownline')
let mailService = new SendMail("Gmail");
const updateAccount = require('../../helpers/updateAccount')
module.exports = {
    getDownlines: ('/', async (req, res)=>{
        let {id} = req.params
        let response
        try {
            let downlines = await getDownlines(id)
            response = new BaseResponse(successStatus, successStatus, successCode, downlines)
            res.status(200).send(response)            
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)            
        }
    }),
    fetchMemberDetails: ('/', async (req, res)=>{
        let {id} = req.params
        let response
        try {
            let member = await Models.Members.findOne({
                where:{
                    user_id: id
                },
                attributes:["current_stage", "referral_id"] 
            })
            let downlinesCount = await Models.Members.count({
                where: {
                    sponsor_id: id
                }
            })
            console.log(downlinesCount) 
            if(member != null && member != undefined){
                response = new BaseResponse(successStatus, successStatus, successCode, {current_stage: member.current_stage, referral_id: member.referral_id, referrals :downlinesCount})
                return res.status(200).json(response)
            }else{
                response = new BaseResponse(failureStatus, "Member not found", failureCode, {})
                return res.status(404).send(response)
            }        
        } catch (error) {
            console.log(error)
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)            
        }
    }),
    getReferrals: ('/', async(req, res)=>{
        let {id} = req.params
        let {offset} = req.query
        let response
        try {
            let members = await Models.Members.findAndCountAll({
                where:{
                    sponsor_id: id
                },
                attributes: ['user_id', 'current_stage'],
                offset: offset? Number(offset): 0,
                limit: 10,
                include: [{
                    model: Models.User,
                    as: 'attributes',
                    attributes: ['firstname', 'lastname', 'email']
                }]
            })
            
            response = new BaseResponse(successStatus, successStatus, successCode, members)
            res.status(200).send(response) 
        } catch (error) {
            logger.error(error.toString())
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400)
                .send(response)  
            
        }
    })
}