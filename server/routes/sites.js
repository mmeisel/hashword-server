const router = require('express').Router()
const Site = require('../models/site')

router.get('/',
  (req, res) => {
    Site.findAll({
      where: { userId: req.user.id },
      attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] }
    })
    .then(sites => res.json(sites))
  }
)

router.post('/',
  (req, res) => {
    console.log(req)
  }
)

router.get('/test',
  (req, res) => {
    res.json(new Site({
      userId: req.user.id,
      domain: 'test.com',
      generation: 1,
      pwLength: 16,
      symbols: true
    }))
  }
)

module.exports = router
