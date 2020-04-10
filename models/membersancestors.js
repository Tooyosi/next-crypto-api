/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('membersancestors', {
    'membersMember_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      references: {
        model: 'members',
        key: 'member_id'
      }
    },
    'ancestorMember_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      comment: "null",
      references: {
        model: 'members',
        key: 'member_id'
      }
    }
  }, {
    tableName: 'membersancestors'
  });
};
