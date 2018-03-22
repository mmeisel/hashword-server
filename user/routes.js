const router = require('express').Router()

router.get('', (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    provider: req.user.provider
  })
})

module.exports = router
