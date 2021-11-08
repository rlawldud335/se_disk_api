const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recruitments_tags', {
    recruitments_tags_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    recruitment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recruitments',
        key: 'recruitment_id'
      }
    },
    tag_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'recruitments_tags',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "recruitments_tags_id" },
        ]
      },
      {
        name: "fk_tags_has_recruitments_recruitments1_idx",
        using: "BTREE",
        fields: [
          { name: "recruitment_id" },
        ]
      },
    ]
  });
};
