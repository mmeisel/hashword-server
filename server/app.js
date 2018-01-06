const express = require('express')
const app = express()
const passport = require('passport')
const session = require('express-session')
const expressReactViews = require('express-react-views')

const authRoutes = require('./routes/auth')
const sitesRoutes = require('./routes/sites')
const db = require('./db')

// Test the database connection
db.authenticate()
.then(() => console.log('Connection has been established successfully.'))
.catch(err => console.error('Unable to connect to the database:', err))

// Set up sessions
let mySession = session({
  name: 'sessionId',
  secret: 'phaexohdae2caehoht3Jieroa7aCheif',
  resave: true,
  saveUninitialized: true,
  cookie: {}
})

if (app.get('env') === 'production') {
  mySession.cookie.secure = true
}

app.use(mySession)
app.use(passport.initialize())
app.use(passport.session())

// Views
app.set('views', './server/views')
app.set('view engine', 'jsx')
app.engine('jsx', expressReactViews.createEngine())

// Routes
app.use('/auth', authRoutes)
app.use('/sites', sitesRoutes)

module.exports = app
