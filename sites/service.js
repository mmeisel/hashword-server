const Site = require('./site.model')

const siteService = {}

siteService.get = (userId, options = {}) => {
  let where = { userId }
  let attributes

  if (options.domains) {
    where.domain = options.domains
  }

  if (options.includeSettings) {
    attributes = { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] }
  } else {
    attributes = ['domain', 'rev']
  }

  return Site.findAll({ where, attributes, transaction: options.transaction })
}

siteService.sync = (userId, remoteSiteMap, options = {}) => {
  return Site.findAll({
    where: { userId, domain: Object.keys(remoteSiteMap) },
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    transaction: options.transaction
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
    const conflictMap = {}

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
          // There's a conflict, put our version in the "rejected" list
          conflictMap[domain] = localToRemote(match.local)
        }
      }
    })

    // TODO: do I need updateOnDuplicate here, or will it update everything by default?
    return Site.bulkCreate(localUpdates, { transaction: options.transaction })
      .then(() => ({
        accepted: localUpdates.map(site => site.domain),
        changed: remoteUpdateMap,
        rejected: conflictMap
      }))
  })

  function localToRemote (localSettings) {
    return Object.assign({}, localSettings, { id: undefined, userId: undefined, domain: undefined })
  }

  function remoteToLocal (domain, remoteSettings) {
    return Object.assign({}, remoteSettings, { id: undefined, userId, domain })
  }
}

module.exports = siteService
