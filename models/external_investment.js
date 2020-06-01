/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('external_investment', {
    'investment_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'name': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'phone': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'username': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'address': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'city': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'state': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'country': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'nationality': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'account_name': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'account_number': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'bank_name': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'amount_invested': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'investment_duration': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'payment_ref': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'email': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'isRedeemed': {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      comment: "null"
    },
    'account_type': {
      type: DataTypes.STRING(255),
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
    tableName: 'external_investment'
  });
};
