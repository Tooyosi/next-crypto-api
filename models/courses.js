/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('courses', {
    'course_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'title': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'description': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'member_stage': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'video_url': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'video_asset_id': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'public_id': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'video_id': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'thumbnail_url': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'date_created': {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "null"
    },
    'date_updated': {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'courses'
  });
};
