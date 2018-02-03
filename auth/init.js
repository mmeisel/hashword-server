const passport = require('passport')
const db = require('../db')

module.exports = app => {
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => db.User.findById(id).then(user => done(null, user)))

  app.use(passport.initialize())
  app.use(passport.session())
}
