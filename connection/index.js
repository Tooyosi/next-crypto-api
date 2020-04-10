const Sequelize = require('sequelize');
require('sequelize-hierarchy')(Sequelize)
const sequelize = new Sequelize((process.env.DB_NAME).trim(), (process.env.DB_USER).trim(), (process.env.DB_PASSWORD).trim(), {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    define: {
        timestamps: false
    }
});


module.exports = sequelize;
