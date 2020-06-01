/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('articles', {
    'article_id': {
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
    'description': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'contents': {
      type: DataTypes.TEXT,
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
    tableName: 'articles'
  });
};
