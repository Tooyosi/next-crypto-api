const express = require('express');
const models = require('../connection/sequelize')
const { logger } = require('../loggers/logger')

let fee = async (amount)=>{
    let id
    if(amount >= 1000 && amount < 5000){
        id = 1
    }else if(amount >= 5000 && amount < 10000){
        id = 2
    }else if(amount >= 10000 && amount < 50000){
        id = 3
    }else if(amount > 50000){
        id = 4
    }

    let result = await models.Fees.findOne({
        where: {
            fee_id: id
        }
    })

    return result;
}

module.exports = fee;