/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'firstname': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'lastname': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'email': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null",
      unique: {
        args: true,
        msg: 'Email address already in use!'
      }
    },
    'phone': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'password': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'transaction_pin': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'last_login_date': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'country': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'user_type_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null",
      references: {
        model: 'user_types',
        key: 'user_type_id'
      }
    },
    'isActivated': {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      comment: "null"
    },
    'isApproved': {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      comment: "null"
    },
    'isAffiliate': {
      type: DataTypes.INTEGER(1),
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
    },
    'access_token': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'refresh_token': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'token_expiry_date': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'payment_mode': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'payment_proof': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'payment_reference': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'reset_password_token': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'reset_password_expiry': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'user'
  });
};
