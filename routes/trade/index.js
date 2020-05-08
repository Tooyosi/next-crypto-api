const express = require("express");
const router = express.Router({mergeParams: true})
const tradeController = require('../../controllers/trade/index')
const {protected, refresh, isLoggedUser} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: Trade
 *   description: Trade Routes
 */

/**
* @swagger
* /trade:
*   post:
*     summary:  Signup/ User creation Route .
*     tags: [Trade]

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
*              -amount
*              -walletId
*              -email
*              -charges
*              -paymentRef
*            properties:
*              amount:
*                type: string
*              walletId:
*                type: string
*              email:
*                type: string
*              charges:
*                type: string
*              paymentRef:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/', tradeController.trade)


module.exports = router