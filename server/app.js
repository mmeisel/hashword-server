const express = require('express')
const app = express()
const passport = require('passport')
const session = require('express-session')

const routes = require('./routes')
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

// Main routes
app.use('/', routes)

app.listen(3000, () => console.log('Example app listening on port 3000!'))

module.exports = app
