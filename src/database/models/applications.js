const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('applications', {
    application_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    application_stat: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    application_created_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
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
    tableName: 'applications',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "application_id" },
        ]
      },
      {
        name: "fk_applications_users1_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "fk_applications_recruitments1_idx",
        using: "BTREE",
        fields: [
          { name: "recruitment_id" },
        ]
      },
    ]
  });
};
