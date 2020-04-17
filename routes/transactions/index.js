const express = require("express");
const router = express.Router({mergeParams: true})
const transactionsController = require('../../controllers/transactions/index')
const {protected, refresh, isAdmin} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transactions Route
 */

 
/**
* @swagger
* /transactions:
*   post:
*     summary:  Fetch all transactions .
*     tags: [Transactions]

*     description: This Route fetches all transactions on the platform.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*       - in: query
*         name: reference   
*         schema:
*           type: string
*       - in: query
*         name: offset   
*         schema:
*           type: string
*       - in: query
*         name: amount  
*         schema:
*           type: string
*       - in: query
*         name: date  
*         schema:
*           type: string
*       - in: query
*         name: status  
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/',authenticate, protected, refresh,isAdmin, transactionsController.getAll)


/**
* @swagger
* /transactions/{id}:
*   put:
*     summary:  Admin transaction approval route .
*     tags: [Transactions]

*     description: This approves or declines a users transaction.
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
*              -action
*            properties:
*              action:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.put('/:id', authenticate, protected, refresh,isAdmin,transactionsController.approve)
module.exports = router