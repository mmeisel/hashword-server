const passport = require('passport')
const session = require('express-session')
const BearerStrategy = require('passport-http-bearer').Strategy
const MemoryStore = require('memorystore')(session)

const clients = require('./clients')
const config = require('../config')
const db = require('../db')

const utils = {
  validateClient (req, res, next) {
    if (req.session.client) {
      return next()
    }

    const client = clients[req.query.client_id]

    if (client) {
      req.session.client = client
      // Make sure the change to the session is saved before continuing
      req.session.save(() => next())
    } else {
      res.status(400).json({ error: 'invalid_client' })
    }
  },

  init (path, app) {
    app.use(passport.initialize())

    // Sessions for the auth endpoints only
    app.use(path, session({
      name: 'sessionId',
      secret: config.session.secret,
      store: new MemoryStore({ checkPeriod: 3600000 }),
      cookie: {
        maxAge: config.session.maxAge,
        secure: config.session.secure
      }
    }))
    app.use(path, passport.session())

    // Only store the user ID in the session
    passport.serializeUser((user, done) => done(null, user.id))
    // Retrieve the rest of the user object from the DB
    passport.deserializeUser((id, done) => {
      return db.User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err, null))
    })

    passport.use(new BearerStrategy(
      (accessToken, done) => {
        return db.Token.findOne({
          where: { token: accessToken },
          include: [{ model: db.User, required: true }]
        })
        .then(token => {
          if (token) {
            done(null, token.user, { scope: '*' })
          } else {
            done(null, false)
          }
        })
        .catch(error => done(error))
      }
    ))
  }
}

module.exports = utils
