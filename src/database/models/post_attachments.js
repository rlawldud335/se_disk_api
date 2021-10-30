const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('post_attachments', {
    post_attachment_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'post_id'
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
    tableName: 'post_attachments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "post_attachment_id" },
        ]
      },
      {
        name: "fk_posts_has_files_files1_idx",
        using: "BTREE",
        fields: [
          { name: "file_id" },
        ]
      },
      {
        name: "fk_posts_has_files_posts1_idx",
        using: "BTREE",
        fields: [
          { name: "post_id" },
        ]
      },
    ]
  });
};
