const router = require('express').Router()
const passport = require('passport')
const uid = require('uid-safe')

const db = require('../db')
const utils = require('./utils')
const strategies = {
  github: require('./github'),
  google: require('./google')
}

router.get('/login',
  utils.validateClient,
  (req, res) => res.sendFile('login.html', { root: __dirname })
)

Object.keys(strategies).forEach(strategyName => {
  router.get(`/${strategyName}`, passport.authenticate(strategyName))

  router.get(`/${strategyName}/callback`,
    passport.authenticate(strategyName),
    (req, res) => {
      return uid(30).then(token => {
        const redirectUri = req.session.client.redirectUri

        return db.Token.upsert(
          {
            userId: req.user.id,
            clientId: req.session.client.id,
            token
          },
          { fields: ['token'] }
        ).then(() => {
          // Sessions are only needed to complete the authentication process,
          // we can get rid of it now
          req.session.destroy()
          res.redirect(`${redirectUri}#${token}`)
        })
      }).catch(error => {
        console.error(error)

        req.session.destroy()
        res.sendStatus(500)
      })
    }
  )
})

module.exports = router
