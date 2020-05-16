/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('investments', {
    'investment_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null",
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    'amount_invested': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'current_amount': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'total_profits': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'isRedeemed': {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      comment: "null"
    },
    'isCanceled': {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      comment: "null"
    },
    'isNotificationSent': {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      comment: "null"
    },
    'due_date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'date_created': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'date_updated': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'investments'
  });
};
