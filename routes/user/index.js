const express = require("express");
const router = express.Router({mergeParams: true})
const userController = require('../../controllers/user/index')

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
module.exports = router