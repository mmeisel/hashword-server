const passport = require('passport')
const User = require('../users/user.model')

module.exports = () => {
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)))
}
