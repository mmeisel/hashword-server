const express = require('express')
const router = express.Router()

const passportGithub = require('./auth/github')
const passportGoogle = require('./auth/google')

router.get('/login', (req, res, next) => {
  res.json({ error: 'Go back and register!' })
})

router.get('/auth/github', passportGithub.authenticate('github', { scope: [ 'user:email' ] }))

router.get('/auth/github/callback',
  passportGithub.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => res.json(req.user)
)

router.get('/auth/google', passportGoogle.authenticate('google'))

router.get('/auth/google/callback',
  passportGoogle.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => res.json(req.user)
)

module.exports = router
