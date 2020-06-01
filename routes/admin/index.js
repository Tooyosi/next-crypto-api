const express = require("express");
const router = express.Router({mergeParams: true})
const adminController = require('../../controllers/admin/index')
const {protected, refresh, isAdmin} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin Route
 */

 
/**
* @swagger
* /admin/approve:
*   get:
*     summary:  Fetch all users for approvals .
*     tags: [Admin]

*     description: This Route fetches all unapproved users on the platform.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*       - in: query
*         name: offset   
*         schema:
*           type: string
*       - in: query
*         name: searchTerm  
*         schema:
*           type: string
*       - in: query
*         name: isKycUpdated  
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Success.
*       400:
*         description: Bad Request.
*/
router.get('/approve',authenticate, protected, refresh,isAdmin, adminController.getAllUsers)


/**
* @swagger
* /admin/approve/{id}:
*   put:
*     summary:  Admin user approval route .
*     tags: [Admin]

*     description: This approves or blocks a users.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*       - in: path
*         name: id   
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*           description: The user id
*       - in: query
*         name: isKycUpdated  
*         schema:
*           type: string
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -action
*            properties:
*              action:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.put('/approve/:id', authenticate, protected, refresh,isAdmin,adminController.approve)
module.exports = router