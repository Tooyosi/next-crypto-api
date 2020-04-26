/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('commission_types', {
    'commission_type_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'commission_name': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'commission_types'
  });
};
