const express = require('express');
const models = require('../connection/sequelize')
const { logger } = require('../loggers/logger')

let notification = async (userId, message, date)=>{
    let result = await models.Notifications.create({
        user_id: userId,
        message: message,
        date: date
    })

    return result;
}

module.exports = notification;