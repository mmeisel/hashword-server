const router = require('express').Router()
const passportGithub = require('../auth/github')
const passportGoogle = require('../auth/google')

router.get('/github', passportGithub.authenticate('github'))

router.get('/github/callback',
  passportGithub.authenticate('github', { failureRedirect: '/login-failure.html' }),
  (req, res) => res.render('login-success', { user: req.user })
)

router.get('/google', passportGoogle.authenticate('google'))

router.get('/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/login-failure.html' }),
  (req, res) => res.render('login-success', { user: req.user })
)

module.exports = router
