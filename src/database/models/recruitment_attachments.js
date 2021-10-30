const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recruitment_attachments', {
    recruitment_attachment_id: {
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
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'files',
        key: 'file_id'
      }
    }
  }, {
    sequelize,
    tableName: 'recruitment_attachments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "recruitment_attachment_id" },
        ]
      },
      {
        name: "fk_recruitments_has_files_files1_idx",
        using: "BTREE",
        fields: [
          { name: "file_id" },
        ]
      },
      {
        name: "fk_recruitments_has_files_recruitments1_idx",
        using: "BTREE",
        fields: [
          { name: "recruitment_id" },
        ]
      },
    ]
  });
};
