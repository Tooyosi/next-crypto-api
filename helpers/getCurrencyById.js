const express = require('express');
const models = require('../connection/sequelize')
const { logger } = require('../loggers/logger')

let currency = async (id)=>{
    let result = await models.Currencies.findOne({
        where: {
            id: id
        }
    })

    return result;
}

module.exports = currency;