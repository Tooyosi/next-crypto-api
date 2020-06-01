const express = require("express");
const router = express.Router({mergeParams: true})
const articlesController = require('../../controllers/articles/index')
const {protected, refresh, isAdmin, isAffiliate} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Articles Route
 */

/**
* @swagger
* /articles:
*   post:
*     summary:  Articles route.
*     tags: [Articles]
*     description: This lets none members of the platform invest.
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
*            properties:
*              name:
*                required: true
*                type: string
*              contents:
*                required: true
*                type: string
*              description:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/',authenticate,refresh, isAdmin,articlesController.post)


/**
* @swagger
* /articles/{id}:
*   put:
*     summary:  Admin Investment route to indicate redeemed external investment.
*     tags: [Articles]
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
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            properties:
*              name:
*                type: string
*              contents:
*                type: string
*              description:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.put('/:id',authenticate,refresh, isAdmin, articlesController.put)

/**
* @swagger
* /articles:
*   get:
*     summary: Gets all Articles.
*     tags: [Articles]
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
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/', articlesController.get)

/**
* @swagger
* /articles/{id}:
*   get:
*     summary:  Admin Investment route to indicate redeemed external investment.
*     tags: [Articles]
*     consumes:
*       — application/json
*     parameters:
*       - in: path
*         name: id  
*         required: true
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/:id', articlesController.getSingle)

module.exports = router