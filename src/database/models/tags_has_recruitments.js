const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tags_has_recruitments', {
    tags_has_recruitment_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tags',
        key: 'tag_id'
      }
    },
    recruitment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recruitments',
        key: 'recruitment_id'
      }
    }
  }, {
    sequelize,
    tableName: 'tags_has_recruitments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tags_has_recruitment_id" },
        ]
      },
      {
        name: "fk_tags_has_recruitments_recruitments1_idx",
        using: "BTREE",
        fields: [
          { name: "recruitment_id" },
        ]
      },
      {
        name: "fk_tags_has_recruitments_tags1_idx",
        using: "BTREE",
        fields: [
          { name: "tag_id" },
        ]
      },
    ]
  });
};
