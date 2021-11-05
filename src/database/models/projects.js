const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('projects', {
    project_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    project_title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    project_image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    project_subject: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    project_subject_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    project_professor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    project_leader: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_hit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    project_created_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    project_category: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    project_like: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    project_introduction: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'projects',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "project_id" },
        ]
      },
    ]
  });
};
