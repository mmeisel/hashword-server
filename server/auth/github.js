const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy

const User = require('../models/user')
const config = require('../_config')
const init = require('./init')

passport.use(new GitHubStrategy(
  {
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: 'http://localhost:3000/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({
      where: {
        provider: 'github',
        providerId: profile.id
      },
      defaults: {
        name: profile.displayName,
        email: (profile.emails && profile.emails.length) ? profile.emails[0].value : null
      }
    })
    .then(done)
  }
))

// Serialize user into the session
init()

module.exports = passport
