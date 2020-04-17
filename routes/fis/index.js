const express = require("express");
const router = express.Router({mergeParams: true})
const fisController = require('../../controllers/fis/index')
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

router.post('/btc', fisController.btcConvert)
module.exports = router