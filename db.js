const Sequelize = require('sequelize')
const config = require('./config')

const sequelize = new Sequelize(config.database.uri, {
  password: config.database.password,
  operatorsAliases: {}
})

const db = {
  sequelize,
  User: sequelize.import('./users/user.model.js'),
  Site: sequelize.import('./sites/site.model.js')
}

db.User.associate(db)

module.exports = db
