'use strict';
const passport = require('passport');
const Strategy = require('passport-local');
const models = require('../connection/sequelize')
const md5 = require('md5')

passport.use(new Strategy({
    // set the fields to be used for validation
    usernameField: 'email',
    passwordField: 'password'
},
    async (username, password, done) => {
        let userDetails = await models.User.findOne({
            attributes: ['email', 'phone', 'user_id'],
            where: {
                email: username,
                password: md5(password)
            },
            include: [{
                model: models.UserTypes,
                as: 'user_type',
                attributes: ['user_type']

            }, {
                model: models.Wallet,
                as: 'wallet',
                attributes: ['amount']

            }],
        })
        if (userDetails !== null && userDetails !== undefined) {
            let userInformation
            switch (userDetails.dataValues.user_type_id) {
                case 1:
                    userInformation = await models.Individual.findOne({
                        attributes: ['firstname', 'lastname'],
                        where: {
                            user_id: userDetails.dataValues.user_id
                        }
                    })
                    break;
                case 2:
                    userInformation = await models.Business.findOne({
                        attributes: ['business_name', 'business_type', 'website'],
                        where: {
                            user_id: userDetails.dataValues.user_id
                        }
                    })
                    break;
                case 3:
                case 4:
                case 5:
                    break;
                default:
                    break;
            }
            let {dataValues} = userDetails;
            dataValues.userInformation = userInformation
            delete(dataValues.password)
            delete(dataValues.user_type_id)

            done(null, dataValues)
        } else {
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