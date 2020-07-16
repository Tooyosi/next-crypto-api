const express = require("express");
const router = express.Router({mergeParams: true})
const tradeController = require('../../controllers/trade/index')
const {isAdmin, refresh, isLoggedUser} = require('../../middleware/index')
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

/**
 * @swagger
 * tags:
 *   name: Trade
 *   description: Trade Routes
 */

/**
* @swagger
* /trade/sell:
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
*              -account_number
*              -account_name
*              -bank_name
*              -bank_code
*              -proof_of_payment
*              -amount
*              -crypto_value
*              -currency
*            properties:
*              account_number:
*                type: string
*              account_name:
*                type: string
*              bank_name:
*                type: string
*              bank_code:
*                type: string
*              proof_of_payment:
*                type: string
*              amount:
*                type: string
*              crypto_value:
*                type: string
*              currency:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/sell', tradeController.sale)

/**
* @swagger
* /trade:
*   get:
*     summary: Gets all external trading on the platform.
*     tags: [Trade]
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
*         required: true
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/', tradeController.get)


/**
* @swagger
* /trade/sell:
*   get:
*     summary: Gets all external sale  on the platform.
*     tags: [Trade]
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
*         required: true
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/sell', tradeController.getSales)

/**
* @swagger
* /trade/sell/{id}:
*   put:
*     summary: Gets sale confirmation route.
*     tags: [Trade]
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
*           description: The sale id
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.put('/sell/:id',authenticate,refresh, isAdmin, tradeController.confirmSale)
module.exports = router