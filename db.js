const Sequelize = require('sequelize')
const config = require('./_config')

const sequelize = new Sequelize(Object.assign(config.database, { operatorsAliases: {} }))

const db = {
  sequelize,
  User: sequelize.import('./users/user.model.js'),
  Site: sequelize.import('./sites/site.model.js')
}

db.User.associate(db)

module.exports = db
