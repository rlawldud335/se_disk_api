const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('chats', {
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    chat_content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    chat_room_id: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    chat_created_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    chat_hit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sender: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    receiver: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    }
  }, {
    sequelize,
    tableName: 'chats',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "chat_id" },
        ]
      },
      {
        name: "fk_chats_users1_idx",
        using: "BTREE",
        fields: [
          { name: "sender" },
        ]
      },
      {
        name: "fk_chats_users2_idx",
        using: "BTREE",
        fields: [
          { name: "receiver" },
        ]
      },
    ]
  });
};
