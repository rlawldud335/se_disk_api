const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    user_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_login_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: "user_login_id_UNIQUE"
    },
    user_password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    user_type: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    user_name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    user_image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_introduction: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_github: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_blog: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_position: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_created_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    user_notification_stat: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_school_num: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_salt: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "user_login_id_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_login_id" },
        ]
      },
    ]
  });
};
