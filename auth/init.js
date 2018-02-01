const passport = require('passport')
const db = require('../db')

module.exports = () => {
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => db.User.findById(id).then(user => done(null, user)))
}
