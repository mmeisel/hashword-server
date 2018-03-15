const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const db = require('../db')
const config = require('../config')

passport.use(new GoogleStrategy(
  {
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: 'profile email openid'
  },
  (accessToken, refreshToken, profile, done) => {
    db.User.findOrCreate({
      where: {
        provider: 'google',
        providerId: profile.id
      },
      defaults: {
        name: profile.displayName,
        email: profile.emails.length ? profile.emails[0].value : null,
        accessToken,
        refreshToken
      }
    })
    .spread((user, created) => done(null, user))
  }
))

module.exports = passport
