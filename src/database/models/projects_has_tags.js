const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('projects_has_tags', {
    projects_has_tag_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'project_id'
      }
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tags',
        key: 'tag_id'
      }
    }
  }, {
    sequelize,
    tableName: 'projects_has_tags',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "projects_has_tag_id" },
        ]
      },
      {
        name: "fk_projects_has_tags_tags1_idx",
        using: "BTREE",
        fields: [
          { name: "tag_id" },
        ]
      },
      {
        name: "fk_projects_has_tags_projects1_idx",
        using: "BTREE",
        fields: [
          { name: "project_id" },
        ]
      },
    ]
  });
};
