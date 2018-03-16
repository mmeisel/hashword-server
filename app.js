const express = require('express')
const app = express()
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const bodyParser = require('body-parser')
const cacheController = require('express-cache-controller')

const authInit = require('./auth/init')
const db = require('./db')
const config = require('./config')

// Test the database connection
db.sequelize.authenticate()
.then(() => db.sequelize.sync())
.then(() => console.log('Connection has been established successfully.'))
.catch(err => console.error('Unable to connect to the database:', err))

// Set up sessions
let mySession = session({
  name: 'sessionId',
  secret: config.session.secret,
  store: new SequelizeStore({
    db: db.sequelize
  }),
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: config.session.maxAge
  }
})

if (config.env === 'production') {
  mySession.cookie.secure = true
}

app.use(mySession)
authInit(app)

// Other middleware
app.use(bodyParser.json())
app.use(cacheController({ noCache: true, noStore: true, mustRevalidate: true }))

// Routes
app.enable('strict routing')

app.use('/auth', require('./auth/routes'))

// Require autentication for all requests to /api/
app.use('/api', (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(403).json({ error: 'Not authenticated' })
  }
})

app.use('/api/sites', require('./sites/routes'))

app.use('/api/user', require('./user/routes'))

module.exports = app
