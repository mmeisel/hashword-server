const Sequelize = require('sequelize')
const config = require('./config')

const sequelize = new Sequelize(config.database.uri, {
  operatorsAliases: {}
})

const db = {
  sequelize,
  User: sequelize.import('./user/user.model.js'),
  Site: sequelize.import('./sites/site.model.js'),
  Token: sequelize.import('./auth/token.model.js'),
  // Helpers
  updateOrCreate (model, options) {
    return sequelize.transaction(transaction => {
      const findOptions = Object.assign({}, options, { transaction, lock: transaction.LOCK.UPDATE })

      return model.findOne(findOptions).then(user => {
        if (user) {
          user.set(options.defaults)
          return user.save({ transaction }).then(() => user)
        } else {
          return model.create(Object.assign({}, options.where, options.defaults), { transaction })
        }
      })
    })
  }
}

db.User.associate(db)
db.Token.associate(db)

module.exports = db
