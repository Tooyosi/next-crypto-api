/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_wallet_fund_request', {
    'id': {
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
    'wallet_address': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'currency': {
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
    tableName: 'user_wallet_fund_request'
  });
};
