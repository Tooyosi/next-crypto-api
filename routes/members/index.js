const express = require("express");
const router = express.Router({mergeParams: true})
const membersController = require('../../controllers/members/index')
const {protected, refresh, isLoggedUser} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Members route
 */

 
/**
* @swagger
* /members/{id}/downlines:
*   get:
*     summary:  Fetch all members downlines .
*     tags: [Members]
*     description: This Route fetches all members downlines in tree view.
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
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/:id/downlines',authenticate, protected,refresh, membersController.getDownlines)

/**
* @swagger
* /members/{id}:
*   get:
*     summary:  Fetch a members detail .
*     tags: [Members]
*     description: This Route a members detail.
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
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/:id',authenticate, protected,refresh,isLoggedUser, membersController.fetchMemberDetails)

module.exports = router