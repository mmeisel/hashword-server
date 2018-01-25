const router = require('express').Router()
const sequelize = require('../db')
const siteService = require('../services/site-service')

router.get('/', (req, res) => {
  // By default, only return the domains and their revs. Only if the "settings" request parameter is
  // present (with any value), return all of the settings details, too.
  let includeSettings = req.query.hasOwnProperty('settings')
  let domains = null

  // If there is a list of domains in the query string, return only those domains. The query
  // parameter "d" is used to reduce the chance of reaching the URL character limit
  if (req.query.hasOwnProperty('d')) {
    domains = Array.isArray(req.query.d) ? req.query.d : [req.query.d]
  }

  siteService.get(req.user.id, domains, includeSettings)
    .then(sites => res.json(sites))
})

// This is the main sync endpoint. It should be called with all domains that need to be synced, as
// determined by a call to the GET endpoint.
router.patch('/', (req, res) => {
  // TODO: validate body format (either here or in the service)
  sequelize.transaction(transaction => {
    siteService.sync(req.user.id, req.body, { transaction })
  })
  .then(result => res.json(result))
  .catch(error => res.json({ error }))
})

module.exports = router
