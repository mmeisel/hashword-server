const passport = require('passport')
const GitHubStrategy = require('passport-github2').Strategy
const db = require('../db')
const config = require('../config')

const strategy = new GitHubStrategy(
  {
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: `${config.baseURL}/auth/github/callback`,
    scope: 'user:email'
  },
  (accessToken, refreshToken, profile, done) => {
    db.updateOrCreate(db.User, {
      where: {
        provider: 'github',
        providerId: profile.id
      },
      defaults: {
        name: profile.displayName,
        email: (profile.emails && profile.emails.length) ? profile.emails[0].value : null
      }
    })
    .then(user => done(null, user))
  }
)

passport.use(strategy)

module.exports = strategy
