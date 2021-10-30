const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('questions', {
    question_id: {
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
    question_content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'questions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "question_id" },
        ]
      },
      {
        name: "fk_questions_recruitments1_idx",
        using: "BTREE",
        fields: [
          { name: "recruitment_id" },
        ]
      },
    ]
  });
};
