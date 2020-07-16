/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('currencies', {
    'id': {
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
    'alias': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'buy_rate': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'sell_rate': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'currencies'
  });
};
