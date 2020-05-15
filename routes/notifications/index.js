const express = require("express");
const router = express.Router({mergeParams: true})
const notificationsController = require('../../controllers/notifications/index')

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Notification Routes
 */

/**
* @swagger
* /notification:
*   post:
*     summary:  User transfer Route .
*     tags: [Notification]

*     description: This Route accepts payment notifications.
*     consumes:
*       — application/json
*     parameters:
*       - in: body
*         name: body   
*         required: true
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/', notificationsController.notify)


module.exports = router