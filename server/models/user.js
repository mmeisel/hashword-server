const Sequelize = require('sequelize')
const db = require('../db')

const User = db.define('users',
  {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    provider: {
      type: Sequelize.ENUM('github', 'google'),
      allowNull: false
    },
    providerId: {
      type: Sequelize.STRING(64),
      allowNull: false
    },
    name: {
      type: 'VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
      allowNull: false
    },
    email: {
      type: Sequelize.STRING
    }
  },
  {
    charset: 'latin1',
    collate: 'latin1_swedish_ci',
    indexes: [
      {
        fields: ['provider', 'providerId'],
        unique: true
      }
    ]
  }
)

User.sync()

module.exports = User
