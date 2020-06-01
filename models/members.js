/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('members', {
    'member_id': {
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
    'upline_user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null",
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    'parentId': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null"
    },
    'current_stage': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'account_name': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'account_number': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'bitcoin_wallet': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'eth_wallet': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'bank_name': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'bank_code': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'referral_id': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null",
      unique: true
    },
    'sponsor_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null",
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    'account_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null",
      references: {
        model: 'account',
        key: 'account_id'
      }
    },
    'hierarchyLevel': {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      comment: "null"
    },
    'parentMember_id': {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      comment: "null",
      references: {
        model: 'members',
        key: 'member_id'
      }
    }
  }, {
    tableName: 'members'
  });
};
