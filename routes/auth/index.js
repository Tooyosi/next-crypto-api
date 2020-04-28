const express = require("express");
const router = express.Router({mergeParams: true})
const authController = require('../../controllers/auth/index')
let {protected, refresh} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});

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

/**
* @swagger
* /auth/refresh:
*   post:
*     summary: User refresh token Route .
*     tags: [Auth]
*     description: This Route returns a new user access token.
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
*              -token
*              -refreshToken
*            properties:
*              token:
*                type: string
*              refreshToken:
*                type: string
*
*     responses: 
*       200:
*         description: Receive a success response.
*       400:
*         description: Bad Request.
*/

router.post('/refresh',authenticate, protected, authController.refreshToken)


/**
* @swagger
* /auth/forgot:
*   post:
*     summary:  User forgot password Route .
*     tags: [Auth]

*     description: This Route creates a refresh token for user password.
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
*            properties:
*              email:
*                type: string
*     responses: 
*       200:
*         description: Successful.
*       400:
*         description: Bad Request.
*       401:
*         description: Unauthorized.
*/
router.post('/forgot', authController.forgotPassword)

/**
* @swagger
* /auth/reset/{token}:
*   get:
*     summary:  User forgot password Route .
*     tags: [Auth]

*     description: This Route creates a refresh token for user password.
*     consumes:
*       — application/json
*     parameters:
*       - in: path
*         name: token   
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*           description: The user reset password token
*     responses: 
*       200:
*         description: Successful.
*       400:
*         description: Bad Request.
*       401:
*         description: Unauthorized.
*/
router.get('/reset/:token', authController.getResetToken)

/**
* @swagger
* /auth/reset/{token}:
*   post:
*     summary:  User forgot password Route .
*     tags: [Auth]

*     description: This Route creates a refresh token for user password.
*     consumes:
*       — application/json
*     parameters:
*       - in: path
*         name: token   
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*           description: The user reset password token
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -password
*            properties:
*              password:
*                type: string
*     responses: 
*       200:
*         description: Successful.
*       400:
*         description: Bad Request.
*       401:
*         description: Unauthorized.
*/
router.post('/reset/:token', authController.postReset)

/**
* @swagger
* /auth/logout:
*   get:
*     summary:  User logout Route .
*     tags: [Auth]

*     description: This Route logs a user out and disables his session.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*     responses: 
*       200:
*         description: Successful.
*       400:
*         description: Bad Request.
*       401:
*         description: Unauthorized.
*/
router.get('/logout',authenticate, protected, refresh ,authController.logOut)
module.exports = router