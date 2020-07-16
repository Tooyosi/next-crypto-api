const express = require("express");
const router = express.Router({mergeParams: true})
const fisController = require('../../controllers/fis/index')
const {protected, refresh, isAdmin} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: Fis
 *   description: Transactions Route
 */

 
/**
* @swagger
* /fis:
*   get:
*     summary:  Fetch all Banks and code .
*     tags: [Fis]

*     description: This Route fetches all Bank list.
*     consumes:
*       — application/json
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/', fisController.loadFis)

 
/**
* @swagger
* /fis/currencies:
*   get:
*     summary:  Fetch all tradable currencies .
*     tags: [Fis]

*     description: This Route fetches all tradable currencies.
*     consumes:
*       — application/json
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/currencies', fisController.loadCurrencies)

/**
* @swagger
* /fis/currencies/{id}:
*   put:
*     summary:  Edits tradable currency rate.
*     tags: [Fis]
*     description: This Route Ediy ratets a tradable currenc.
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
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -buyRate
*              -sellRate
*            properties:
*              buyRate:
*                type: string
*              sellRate:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.put('/currencies/:id',authenticate, protected, refresh, isAdmin,  fisController.putCurrencyRate)


/**
* @swagger
* /fis/btc:
*   post:
*     summary: BTC conversion route .
*     tags: [Fis]
*     description: This Route returns a new user access token.
*     consumes:
*       — application/json
*     parameters:
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*            properties:
*              btc:
*                type: string
*              naira:
*                type: string
*              walletAddress:
*                type: string
*              currencyId:
*                type: string
*
*     responses: 
*       200:
*         description: Receive a success response.
*       400:
*         description: Bad Request.
*/
router.post('/btc', fisController.btcConvert)


/**
* @swagger
* /fis/exchange-rate:
*   get:
*     summary:  Gets Naira to dollar exchange rate .
*     tags: [Fis]

*     description: This Gets Naira to dollar exchange rate.
*     consumes:
*       — application/json
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/exchange-rate', fisController.exchangeRate)


/**
* @swagger
* /fis/rates:
*   get:
*     summary:  Gets naira rates of tradable curriencies on th platform .
*     tags: [Fis]

*     description: This Gets naira rates of tradable curriencies on th platform.
*     consumes:
*       — application/json
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/rates', fisController.getNairaRates)

/**
* @swagger
* /fis/wallet:
*   get:
*     summary:  Gets wallet address for payment .
*     tags: [Fis]

*     description: This Gets wallet address for payment.
*     consumes:
*       — application/json
*     parameters:
*       - in: query
*         name: type  
*         required: true
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.get('/wallet', fisController.getWallet)
module.exports = router