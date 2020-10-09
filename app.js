const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cacheController = require('express-cache-controller')
const cors = require('cors')
const passport = require('passport')

const authUtils = require('./auth/utils')
const db = require('./db')

// Test the database connection
db.sequelize.authenticate()
  .then(() => db.sequelize.sync())
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err))

// Trust the first proxy in production, this will always run behind a web server
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
}

// Middleware

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cacheController({ noCache: true, noStore: true, mustRevalidate: true }))

// Only enable CORS for API endpoints
const corsOptions = { origin: true, credentials: true }
app.use('/api', cors(corsOptions))
app.options('/api/*', cors(corsOptions))

// Authentication
authUtils.init('/auth', app)

// Routes
app.enable('strict routing')

app.use('/auth', require('./auth/routes'))

// Require authentication for all requests to /api
app.use('/api', passport.authenticate('bearer', { session: false }))

app.use('/api/sites', require('./sites/routes'))
app.use('/api/user', require('./user/routes'))

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.json({ error: err })
})

module.exports = app
