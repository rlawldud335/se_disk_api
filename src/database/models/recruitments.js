const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recruitments', {
    recruitment_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    recruitment_title: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    recruitment_content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recruitment_recruited_cnt: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recruitment_recruited_limit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recruitment_deadline_datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    recruitment_stat: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    recruitment_subject: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recruitment_created_datetime: {
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
    }
  }, {
    sequelize,
    tableName: 'recruitments',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "recruitment_id" },
        ]
      },
      {
        name: "fk_recruitments_users1_idx",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
