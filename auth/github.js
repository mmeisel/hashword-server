const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy

const db = require('../db')
const config = require('../config')
const init = require('./init')

passport.use(new GitHubStrategy(
  {
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: 'http://localhost:3000/auth/github/callback',
    scope: 'user:email'
  },
  (accessToken, refreshToken, profile, done) => {
    db.User.findOrCreate({
      where: {
        provider: 'github',
        providerId: profile.id
      },
      defaults: {
        name: profile.displayName,
        email: (profile.emails && profile.emails.length) ? profile.emails[0].value : null
      }
    })
    .spread((user, created) => done(null, user))
  }
))

// Serialize user into the session
init()

module.exports = passport
