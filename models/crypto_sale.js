/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('crypto_sale', {
    'sale_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'payment_reference': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'account_number': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'account_name': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'bank_name': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'bank_code': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'proof_of_payment': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'status': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'amount': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'crypto_value': {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    'date_approved': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'crypto_sale'
  });
};
