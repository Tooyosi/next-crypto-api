const express = require("express");
const router = express.Router({mergeParams: true})
const coursesController = require('../../controllers/courses/index')
const {protected, refresh,isAffiliate, isAdmin} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Courses Route
 */

 
/**
* @swagger
* /courses:
*   get:
*     summary:  Fetch all courses.
*     tags: [Courses]

*     description: This Route fetches courses depending on user stage.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*       - in: query
*         name: stage  
*         type: string
*         required: true 
*       - in: query
*         name: offset  
*         type: string
*         required: true 
*     responses: 
*       200:
*         description: Success.
*       400:
*         description: Bad Request.
*/
router.get('/',authenticate, protected, refresh,isAffiliate, coursesController.getAll)


/**
* @swagger
* /courses:
*   post:
*     summary:  Create a new course.
*     tags: [Courses]

*     description: This creates a new course.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -title
*              -member_stage
*              -video_url
*              -video_asset_id
*              -video_id
*              -thumbnail_url
*            properties:
*              title:
*                type: string
*              description:
*                type: string
*              member_stage:
*                type: integer
*              video_url:
*                type: string
*              video_asset_id:
*                type: string
*              video_id:
*                type: string
*              thumbnail_url:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/', authenticate, protected, refresh,isAdmin,coursesController.post)
module.exports = router