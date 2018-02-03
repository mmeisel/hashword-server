const router = require('express').Router()
const strategies = {
  github: require('./github'),
  google: require('./google')
}

Object.keys(strategies).forEach(strategyName => {
  const strategy = strategies[strategyName]

  router.get(`/${strategyName}`, strategy.authenticate(strategyName))

  router.get(`/${strategyName}/callback`, strategy.authenticate(strategyName, {
    successRedirect: '../success',
    failureRedirect: '../fail'
  }))
})

router.get('/fail', (req, res) => {
  res.status(403).json({ error: 'Login failed' })
})

router.get('/success', (req, res) => {
  res.json({
    user: {
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider
    }
  })
})

module.exports = router
