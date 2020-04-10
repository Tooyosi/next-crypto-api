const Sequelize = require('sequelize');

const UserModel = require("../models/user");
const AccountModel = require("../models/account");
const MembersModel = require("../models/members");
const AdminModel = require("../models/admins");


const sequelize = require('./index')

var models = {}
models.User = UserModel(sequelize, Sequelize)
models.Account = AccountModel(sequelize, Sequelize)
models.Members = MembersModel(sequelize, Sequelize)
models.Admin = AdminModel(sequelize, Sequelize)

models.Members.belongsTo(models.User, {
        onDelete: 'CASCADE',
        foreignKey: 'user_id',
        as: 'details'
});
models.Admin.belongsTo(models.User, {
    onDelete: 'CASCADE',
    foreignKey: 'user_id',
    as: 'details'
});
models.Account.belongsTo(models.User, {
    onDelete: 'CASCADE',
    foreignKey: 'user_id',
    as: 'account'    
})
models.Members.isHierarchy();
sequelize.sync()
    .then((res) => {

        console.log("Db Connnected")
    })
    .catch((err) => {
        console.log(err)
    })

module.exports = models;