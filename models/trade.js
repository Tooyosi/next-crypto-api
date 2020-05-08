/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('trade', {
    'id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'currency': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'email': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'amount': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'charges': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'payment_ref': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'trade'
  });
};
