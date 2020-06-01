let Models = require('../../connection/sequelize')
const BaseResponse = require('../../helpers/ResponseClass')
const { convertDate, successCode, failureCode, validator, validationErrorMessage, failureStatus, successStatus, bin2hashData } = require('../../helpers/index')
const { logger } = require('../../loggers/logger')
const { Op } = require('sequelize')
module.exports = {
    post: ('/', async (req, res) => {
        let { title, description, member_stage, video_url, video_asset_id, video_id, thumbnail_url, public_id } = req.body
        let response
        if (title.trim() == "") {
            response = new BaseResponse(failureStatus, "All Fields are required", failureCode, {})
            return res.status(400).send(response)
        }

        if (member_stage < 1 || member_stage > 5) {
            response = new BaseResponse(failureStatus, "Stages must be between 1 - 5", failureCode, {})
            return res.status(400).send(response)
        }
        try {

            let newCourse = await Models.Courses.create({
                title: title,
                description: description,
                member_stage: member_stage,
                video_url: video_url,
                video_asset_id: video_asset_id,
                video_id: video_id,
                public_id: public_id,
                thumbnail_url: thumbnail_url,
                date_created: convertDate(Date.now())
            })

            response = new BaseResponse(successStatus, successStatus, successCode, {})
            return res.status(200).send(response)

        } catch (error) {
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400).send(response)
        }
    }),
    getAll: ('/', async (req, res) => {
        let response, loggedUser
        let { stage, offset } = req.query
        let whereObj = {}

        if (!req.user.isAdmin) {
            loggedUser = await Models.Members.findOne({
                where: {
                    user_id: req.user.id
                },
                attributes: ["current_stage"]
            })
            whereObj.member_stage = {
                [Op.lte]: loggedUser.current_stage
            }
        }
        try {
            let allCourses = await Models.Courses.findAndCountAll({
                where: whereObj,
                offset: offset ? Number(offset) : offset,
                limit: 10,
                order: [['course_id', 'DESC']],
            })
            response = new BaseResponse(successStatus, successStatus, successCode, allCourses)
            return res.status(200).send(response)
        } catch (error) {
            response = new BaseResponse(failureStatus, error.toString(), failureCode, {})
            return res.status(400).send(response)
        }
    })
}