const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('files', {
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    file_originname: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_filename: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_filesize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    file_width: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    file_height: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    file_extension: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    file_created_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    file_path: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    file_download_cnt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    file_duration: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'files',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "file_id" },
        ]
      },
    ]
  });
};
