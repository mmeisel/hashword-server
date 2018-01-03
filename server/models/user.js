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
      type: Sequelize.STRING,
      allowNull: false
    },
    providerId: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING
    }
  },
  {
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
