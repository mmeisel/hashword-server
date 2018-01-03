const Sequelize = require('sequelize')
const config = require('./_config')

module.exports = new Sequelize(Object.assign(config.database, { operatorsAliases: {} }))
