const express = require("express");
const router = express.Router({mergeParams: true})
const userController = require('../../controllers/user/index')
const {protected, refresh, isLoggedUser} = require('../../middleware/index')
const expressJwt = require('express-jwt');  
const authenticate = expressJwt({secret : process.env.SESSION_SECRET});
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
*              -paystackReference
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
*              paystackReference:
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
* /user/{id}:
*   put:
*     summary:  User Edit Route .
*     tags: [User]

*     description: This Route edits a user on the platform.
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
*              -firstname
*              -lastname
*              -phone
*            properties:
*              firstname:
*                type: string
*              lastname:
*                type: string
*              phone:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.put('/:id',authenticate, protected, refresh ,isLoggedUser,userController.editUser)

/**
* @swagger
* /user/{id}/account:
*   put:
*     summary:  User Edit account Route .
*     tags: [User]

*     description: This Route edits a users account details on the platform.
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
*              -accountName
*              -accountNumber
*              -bankName
*              -bankCode
*              -bitcoinWallet
*            properties:
*              accountName:
*                type: string
*                required: true
*              accountNumber:
*                type: string
*                required: true
*              bankName:
*                type: string
*                required: true
*              bankCode:
*                type: string
*                required: true
*              bitcoinWallet:
*                type: string
*                required: true
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.put('/:id/account',authenticate, protected, refresh ,isLoggedUser,userController.editAccount)

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


/**
* @swagger
* /user/{email}:
*   get:
*     summary:  User Verification Route .
*     tags: [User]

*     description: This Route verifies if a user exists.
*     consumes:
*       — application/json
*     parameters:
*       - in: path
*         name: email   
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
router.get('/:email', userController.validateMail)


/**
* @swagger
* /user/search/{searchTerm}:
*   post:
*     summary:  User search Route .
*     tags: [User]

*     description: This Route searches for a user.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*       - in: path
*         name: searchTerm   
*         required: true
*         schema:
*           type: string
*           minimum: 1
*           description: The search term
*       - in: query
*         name: offset   
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/search/:searchTerm',authenticate,protected, refresh,  userController.getUsers)

/**
* @swagger
* /user/{id}/transactions:
*   post:
*     summary:  User transaction Route .
*     tags: [User]

*     description: This Route creates a new user transaction.
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
*              -type
*              -amount
*              -currency
*            properties:
*              type:
*                type: integer
*              amount:
*                type: string
*              currency:
*                type: integer
*              status:
*                type: string
*              reference:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/:id/transactions',authenticate,protected, refresh, isLoggedUser, userController.postTransactions)


/**
* @swagger
* /user/{id}/transfer:
*   post:
*     summary:  User transfer Route .
*     tags: [User]

*     description: This Route transfers funds from a users account.
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
*              -recepientId
*              -amount
*            properties:
*              recepientId:
*                type: integer
*              amount:
*                type: integer
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/:id/transfer',authenticate,protected, refresh, isLoggedUser, userController.transfer)


/**
* @swagger
* /user/{id}/transactions:
*   get:
*     summary:  Fetch all user transactions .
*     tags: [User]

*     description: This Route fetches all transactions for a user on the platform.
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
*       - in: query
*         name: type  
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/

router.get('/:id/transactions',authenticate,protected, refresh, isLoggedUser, userController.getTransactions)

/**
* @swagger
* /user/{id}/transactions/pin:
*   get:
*     summary:  Generates user transaction pin .
*     tags: [User]

*     description: This Route generates a pin for user transactions on the platform.
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
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/

router.get('/:id/transactions/pin',authenticate,protected, refresh, isLoggedUser, userController.getTransactionPin)

/**
* @swagger
* /user/{id}/transactions/pin:
*   post:
*     summary:  Verifys user transaction pin .
*     tags: [User]

*     description: This Route verifys pin for user transactions on the platform.
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
*              -pin
*            properties:
*              pin:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/

router.post('/:id/transactions/pin',authenticate,protected, refresh, isLoggedUser, userController.verifyTransactionPin)

/**
* @swagger
* /user/{id}/investment:
*   post:
*     summary:  User investment Route .
*     tags: [User]

*     description: This Route creates investment for the user.
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
*              -amount
*              -dueDate
*            properties:
*              amount:
*                type: integer
*              dueDate:
*                type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/:id/investment',authenticate,protected, refresh, isLoggedUser, userController.createInvestment)

/**
* @swagger
* /user/{id}/investment/{investmentId}/redeem:
*   get:
*     summary:  User investment Route .
*     tags: [User]

*     description: This Route redeems investment for the user.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*       - in: path
*         name: investmentId   
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*           description: The user id
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
router.get('/:id/investment/:investmentId/redeem',authenticate,protected, refresh, isLoggedUser, userController.redeemInvestment)


/**
* @swagger
* /user/{id}/investment/{investmentId}/cancel:
*   get:
*     summary:  User investment Route .
*     tags: [User]

*     description: This Route cancels investment for the user.
*     consumes:
*       — application/json
*     parameters:
*       - name: Authorization
*         in: header
*         description: Bearer token
*         type: string
*         required: true
*       - in: path
*         name: investmentId   
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*           description: The user id
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
router.get('/:id/investment/:investmentId/cancel',authenticate,protected, refresh, isLoggedUser, userController.cancelInvestment)

/**
* @swagger
* /user/{id}/investment:
*   get:
*     summary:  Fetch all user investments .
*     tags: [User]

*     description: This Route fetches all investments for a user on the platform.
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
*       - in: query
*         name: offset   
*         schema:
*           type: string
*       - in: query
*         name: amount  
*         schema:
*           type: string
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/

router.get('/:id/investment',authenticate,protected, refresh, isLoggedUser, userController.getInvestments)


/**
* @swagger
* /user/{id}/balance:
*   get:
*     summary:  Fetch users balance .
*     tags: [User]

*     description: This Route fetches a user's balance on the platform.
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
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/

router.get('/:id/balance',authenticate,protected, refresh, isLoggedUser, userController.fetchBalance)

module.exports = router