const express = require("express");
const router = express.Router({mergeParams: true})
const userController = require('../../controllers/user/index')
const {protected, refresh} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Routes
 */

/**
* @swagger
* /user/:
*   post:
*     summary:  Signup/ User creation Route .
*     tags: [User]

*     description: This Route creates a user on the platform.
*     consumes:
*       — application/json
*     parameters:
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -firstname
*              -lastname
*              -email
*              -country
*              -phone
*              -password
*              -isAdmin
*            properties:
*              firstname:
*                type: string
*              lastname:
*                type: string
*              email:
*                type: string
*              country:
*                type: string
*              password:
*                type: string
*              uplineReferralCode:
*                type: string
*              phone:
*                type: string
*              isAdmin:
*                type: boolean 
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/', userController.signup)

/**
* @swagger
* /user/{id}/activate:
*   get:
*     summary:  User activation Route .
*     tags: [User]

*     description: This Route activates an already created user.
*     consumes:
*       — application/json
*     parameters:
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
router.get('/:id/activate', userController.activate)


/**
* @swagger
* /user/{email}:
*   get:
*     summary:  User Verification Route .
*     tags: [User]

*     description: This Route verifies if a user exists.
*     consumes:
*       — application/json
*     parameters:
*       - in: path
*         name: email   
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
router.get('/:email', userController.validateMail)



/**
* @swagger
* /user/{id}/transactions:
*   post:
*     summary:  User transaction Route .
*     tags: [User]

*     description: This Route creates a new user transaction.
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
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -type
*              -amount
*              -currency
*            properties:
*              type:
*                type: integer
*              amount:
*                type: string
*              currency:
*                type: integer
*              status:
*                type: string
*              reference:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/:id/transactions',authenticate,protected, refresh, userController.postTransactions)


/**
* @swagger
* /user/{id}/transfer:
*   post:
*     summary:  User transfer Route .
*     tags: [User]

*     description: This Route transfers funds from a users account.
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
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -recepientId
*              -amount
*            properties:
*              recepientId:
*                type: integer
*              amount:
*                type: integer
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/:id/transfer',authenticate,protected, refresh, userController.transfer)
module.exports = router