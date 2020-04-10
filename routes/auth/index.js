const express = require("express");
const router = express.Router({mergeParams: true})
const authController = require('../../controllers/auth/index')

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Auth Routes
 */

/**
* @swagger
* /auth/login:
*   post:
*     summary:  User Login Route .
*     tags: [Auth]

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
*              -email
*              -password
*            properties:
*              email:
*                type: string
*              password:
*                type: string
*     responses: 
*       200:
*         description: Login Successful.
*       400:
*         description: Bad Request.
*       401:
*         description: Unauthorized.
*/
router.post('/login', authController.postLogin)

module.exports = router