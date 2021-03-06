'use strict';
const passport = require('passport');
const Strategy = require('passport-local');
const models = require('../connection/sequelize')
const {bin2hashData} = require('./index')

passport.use(new Strategy({
    // set the fields to be used for validation
    usernameField: 'email',
    passwordField: 'password'
},
    async (username, password, done) => {
        let userDetails = await models.User.findOne({
            attributes: {exclude: ['date_created', 'date_updated', 'access_token', 'refresh_token', 'payment_mode','payment_proof', 'payment_reference' ,'reset_password_token', 'reset_password_expiry', 'password', "transaction_pin", "transaction_pin"]},
            where: {
                email: username,
                password: bin2hashData(password, process.env.PASSWORD_HASH)
            },
            include: {
                model: models.UserType,
                as: 'user_type',
                attributes: ['user_type']

            },
        })
        if (userDetails !== null && userDetails !== undefined && userDetails.dataValues.isActivated == true && userDetails.dataValues.isApproved == true) {
            let {dataValues} = userDetails
            let userAccount = await models.Account.findOne({
                attributes: ['balance'],
                where:{
                    user_id: userDetails.user_id
                }
            })
            dataValues.balance = userAccount.dataValues
            delete(dataValues.user_type_id)

            done(null, dataValues)
        }else if(userDetails && userDetails.dataValues.isActivated == false) {
            done(null, false, "User not activated, Kindly activate your account");
        }else if(userDetails && userDetails.dataValues.isApproved == false) {
            done(null, false, "User not Approved, Kindly contact support");
        }
        else {
            done(null, false, "Invalid Credentials");
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.user_id)
})

passport.deserializeUser((id, done) => {
    const users = user.user_id === id ? user : false
    done(null, users)
})

module.exports = passport;