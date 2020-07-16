const express = require("express");
const router = express.Router({mergeParams: true})
const membersController = require('../../controllers/members/index')
const {protected, refresh, isLoggedUser, isAffiliate} = require('../../middleware/index')
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
router.get('/:id/downlines',authenticate, protected,refresh, isAffiliate, membersController.getDownlines)

/**
* @swagger
* /members/{id}/referrals:
*   get:
*     summary:  Fetch all members referrals .
*     tags: [Members]
*     description: This Route fetches all members referrals.
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
*         name: offset   
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/:id/referrals',authenticate, protected,refresh, isLoggedUser, isAffiliate, membersController.getReferrals)

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