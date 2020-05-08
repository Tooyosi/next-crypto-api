const Sequelize = require('sequelize');

const UserModel = require("../models/user");
const AccountModel = require("../models/account");
const MembersModel = require("../models/members");
const AdminModel = require("../models/admins");
const UserTypeModel = require("../models/user_types");
const TransactionsModel = require("../models/transactions");
const TransfersModel = require("../models/transfer");
const NotificationsModel = require("../models/notifications");
const InvestmentsModel = require("../models/investments");
const CommissionsModel = require("../models/commissions");
const TradeModel = require("../models/trade");



const sequelize = require('./index')

var models = {}
models.User = UserModel(sequelize, Sequelize)
models.Account = AccountModel(sequelize, Sequelize)
models.Members = MembersModel(sequelize, Sequelize)
models.Admin = AdminModel(sequelize, Sequelize)
models.UserType = UserTypeModel(sequelize, Sequelize)
models.Transactions = TransactionsModel(sequelize, Sequelize)
models.Transfers = TransfersModel(sequelize, Sequelize)
models.Notifications = NotificationsModel(sequelize, Sequelize)
models.Investments = InvestmentsModel(sequelize, Sequelize)
models.Commissions = CommissionsModel(sequelize, Sequelize)
models.Trade = TradeModel(sequelize, Sequelize)

models.Notifications.belongsTo(models.User, {
    onDelete: 'CASCADE',
    foreignKey: 'user_id',
    as: "notifications"
})

models.Transactions.belongsTo(models.Members, {
    onDelete: 'CASCADE',
    foreignKey: 'user_id',
    as: "member"
})

models.Transfers.belongsTo(models.User, {
    onDelete: 'CASCADE',
    foreignKey: 'sender_id',
    as: "sender"
})

models.Transfers.belongsTo(models.User, {
    onDelete: 'CASCADE',
    foreignKey: 'recepient_id',
    as: "reciever"
})
models.User.belongsTo(models.UserType, {
    onDelete: 'CASCADE',
    foreignKey: 'user_type_id',
    as: 'user_type'
});
models.Members.belongsTo(models.User, {
        onDelete: 'CASCADE',
        foreignKey: 'user_id',
        as: 'attributes'
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