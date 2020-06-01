const express = require("express");
const router = express.Router({mergeParams: true})
const investmentController = require('../../controllers/investments/index')
const {protected, refresh, isAdmin, isAffiliate} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: Investment
 *   description: External Users Investment route
 */









/**
* @swagger
* /invest:
*   post:
*     summary:  External Users Investment route.
*     tags: [Investment]
*     description: This lets none members of the platform invest.
*     consumes:
*       — application/json
*     parameters:
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            properties:
*              acctName:
*                required: true
*                type: string
*              bankName:
*                type: string
*              acctNumber:
*                type: string
*              acctType:
*                type: string
*              amount:
*                type: string
*              duration:
*                type: integer
*              paymentReference:
*                type: string
*              name:
*                type: string
*              phone:
*                type: string
*              username:
*                type: string
*              address:
*                type: string
*              city:
*                type: string
*              state:
*                type: string
*              email:
*                type: string
*              country:
*                type: string
*              nationality:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/',investmentController.post)


/**
* @swagger
* /invest/{id}/redeem:
*   put:
*     summary:  Admin Investment route to indicate redeemed external investment.
*     tags: [Investment]
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
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.put('/:id/redeem',authenticate,refresh, isAdmin, investmentController.put)

/**
* @swagger
* /invest:
*   get:
*     summary: Gets all external investment on the platform.
*     tags: [Investment]
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
router.get('/',authenticate,refresh, isAdmin, investmentController.get)
module.exports = router