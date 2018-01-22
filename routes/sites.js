const router = require('express').Router()
const sequelize = require('../db')
const Site = require('../models/site')

router.get('/', (req, res) => {
  let where = { userId: req.user.id }
  let attributes

  // If there is a list of domains in the query string, return only those domains. The query
  // parameter "d" is used to reduce the chance of reaching the URL character limit
  if (req.query.hasOwnProperty('d')) {
    where.domain = Array.isArray(req.query.d) ? req.query.d : [req.query.d]
  }

  // By default, only return the domains and their revs. Only if the "settings" request parameter is
  // present (with any value), return all of the settings details, too.
  if (req.query.hasOwnProperty('settings')) {
    attributes = { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] }
  } else {
    attributes = ['domain', 'rev']
  }

  Site.findAll({ where, attributes })
    .then(sites => res.json(sites))
})

// This is the main sync endpoint. It should be called with all domains that need to be synced, as
// determined by a call to the GET endpoint.
router.patch('/', (req, res) => {
  const remoteSiteMap = req.body

  // TODO: validate remoteSiteMap format

  sequelize.transaction(transaction => {
    Site.findAll({
      where: { userId: req.user.id, domain: Object.keys(remoteSiteMap) },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      transaction
    })
    .then(localSites => {
      const localOnly = {}
      const remoteOnly = {}
      const matches = {}

      // Note that remoteSiteMap is an object mapping domain names to settings, but localSites is
      // an array with the domain in the object

      // Find out which domains are in both places versus not present remotely (represented by the
      // domain mapping to null in the input)
      localSites.forEach(localSite => {
        const remoteSite = remoteSiteMap[localSite.domain]

        if (remoteSite == null) {
          localOnly[localSite.domain] = localSite
        } else {
          matches[localSite.domain] = { local: localSite, remote: remoteSite }
        }
      })

      // Look for remote sites that we don't have locally
      Object.keys(remoteSiteMap).forEach(remoteDomain => {
        if (!localOnly.hasOwnProperty(remoteDomain) && !matches.hasOwnProperty(remoteDomain)) {
          remoteOnly[remoteDomain] = remoteSiteMap[remoteDomain]
        }
      })

      // Figure out which sites from matchedDomains need to be updates
      const remoteUpdateMap = {}
      // Add remoteOnlyDomains to localUpdates so they'll be inserted
      const localUpdates = remoteOnly.map(domain => remoteToLocal(domain, remoteSiteMap[domain]))

      Object.keys(matches).forEach(domain => {
        const match = matches[domain]

        if (match.local.rev !== match.remote.rev) {
          // Check for ancestry
          if (match.local.history.includes(match.remote.rev)) {
            // We have a newer version locally, send this to the remote
            remoteUpdateMap[domain] = localToRemote(match.local)
          } else if (match.remote.history.includes(match.local.rev)) {
            // They have a newer version remotely, replace the local version
            localUpdates.push(remoteToLocal(domain, match.remote))
          } else {
            // TODO: CONFLICT! Just log something for now.
            console.warn('Conflict for domain', domain, match.local, match.remote)
          }
        }
      })

      res.json(remoteUpdateMap)

      // TODO: do I need updateOnDuplicate here, or will it update everything that's specified?
      return Site.bulkCreate(localUpdates, { transaction })
    })
  })

  function localToRemote (localSettings) {
    return Object.assign({}, localSettings, { id: undefined, userId: undefined, domain: undefined })
  }

  function remoteToLocal (domain, remoteSettings) {
    return Object.assign({}, remoteSettings, { id: undefined, userId: req.user.id, domain })
  }
})

router.get('/test', (req, res) => {
  res.json(new Site({
    userId: req.user.id,
    domain: 'test.com',
    generation: 1,
    pwLength: 16,
    symbols: true
  }))
})

module.exports = router
