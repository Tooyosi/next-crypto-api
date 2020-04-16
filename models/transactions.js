/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transactions', {
    'transaction_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'transaction_type': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
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
    'date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'amount': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'transaction_status': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'currency': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'transaction_reference': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'transactions'
  });
};
