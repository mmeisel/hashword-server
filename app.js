const express = require('express')
const app = express()
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const bodyParser = require('body-parser')

const authInit = require('./auth/init')
const authRoutes = require('./auth/routes')
const sitesRoutes = require('./sites/routes')
const db = require('./db')

// Test the database connection
db.sequelize.authenticate()
.then(() => db.sequelize.sync())
.then(() => console.log('Connection has been established successfully.'))
.catch(err => console.error('Unable to connect to the database:', err))

// Set up sessions
let mySession = session({
  name: 'sessionId',
  secret: 'phaexohdae2caehoht3Jieroa7aCheif',
  store: new SequelizeStore({
    db: db.sequelize
  }),
  resave: false,
  saveUninitialized: true,
  cookie: {}
})

if (app.get('env') === 'production') {
  mySession.cookie.secure = true
}

app.use(mySession)
authInit(app)

// Other middleware
app.use(bodyParser.json())

// Routes
app.use('/auth', authRoutes)

// Require autentication for all requests to /api/
app.use('/api', (req, res, next) => {
  if (req.user == null) {
    res.status(403).json({ error: 'Not authenticated' })
  } else {
    next()
  }
})

app.use('/api/sites', sitesRoutes)

module.exports = app
