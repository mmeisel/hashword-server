const router = require('express').Router()
const passport = require('passport')
const strategies = {
  github: require('./github'),
  google: require('./google')
}

router.get('/', (req, res) => {
  res.sendFile(req.isAuthenticated() ? 'success.html' : 'login.html', { root: __dirname })
})

Object.keys(strategies).forEach(strategyName => {
  router.get(`/${strategyName}`, passport.authenticate(strategyName))

  router.get(`/${strategyName}/callback`,
    passport.authenticate(strategyName, { failureRedirect: '../fail' }),
    // Due to a bug in express, we must explicitly save the session here. See
    // https://github.com/expressjs/session/pull/69
    (req, res) => req.session.save(() => res.redirect('../'))
  )
})

router.get('/fail', (req, res) => {
  res.status(403).json({ error: 'Login failed' })
})

module.exports = router
