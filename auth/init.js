const passport = require('passport')
const db = require('../db')

module.exports = app => {
  // Only store the user ID in the session
  passport.serializeUser((user, done) => done(null, user.id))
  // Retrieve the rest of the user object from the DB
  passport.deserializeUser((id, done) => {
    db.User.findById(id)
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })

  app.use(passport.initialize())
  app.use(passport.session())
}
