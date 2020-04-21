const db = require('../db')

const siteService = {}

siteService.get = (userId, options = {}) => {
  const where = { userId }
  let attributes

  if (options.domains) {
    where.domain = options.domains
  }

  if (options.includeSettings) {
    attributes = { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] }
  } else {
    attributes = ['domain', 'rev', 'accessDate']
  }

  return db.User.findOne({
    where: { id: userId },
    include: [{
      model: db.Site,
      required: false,
      where,
      attributes
    }],
    transaction: options.transaction
  }).then(user => {
    if (user == null) {
      throw new Error('Invalid user')
    }

    const output = {}

    user.sites.forEach(site => (output[site.domain] = localToRemote(site)))
    return output
  })
}

siteService.sync = (userId, remoteSiteMap, options = {}) => {
  return db.User.findOne({
    where: { id: userId },
    include: [{
      model: db.Site,
      required: false,
      where: { domain: Object.keys(remoteSiteMap) },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    }],
    transaction: options.transaction
  }).then(user => {
    if (user == null) {
      throw new Error('Invalid user')
    }

    const localSites = user.sites
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
      if (!(remoteDomain in localOnly) && !(remoteDomain in matches)) {
        remoteOnly[remoteDomain] = remoteSiteMap[remoteDomain]
      }
    })

    const remoteUpdateMap = {}
    // Add remoteOnly to localUpdates so they'll be inserted
    const localUpdates = Object.keys(remoteOnly).map(domain => {
      return remoteToLocal(domain, remoteSiteMap[domain], userId)
    })
    const conflictMap = {}

    // Add localOnly to remoteUpdateMap so the remote will update them
    Object.keys(localOnly).forEach(domain => {
      remoteUpdateMap[domain] = localToRemote(localOnly[domain])
    })

    // Figure out which sites from matches need to be updates
    Object.keys(matches).forEach(domain => {
      const match = matches[domain]

      if (match.local.rev === match.remote.rev) {
        // When the rev is the same, ensure the accessDate is up-to-date
        // TODO: should we sanity-check these dates at all? We can't sanity-check the deleteDate
        //       very easily since it's in the rev...
        if (match.local.accessDate < match.remote.accessDate) {
          localUpdates.push(remoteToLocal(domain, match.remote, userId, match.local.id))
        } else if (match.local.accessDate > match.remote.accessDate) {
          remoteUpdateMap[domain] = localToRemote(match.local)
        }
      } else {
        // Check for ancestry
        if (match.local.history.includes(match.remote.rev)) {
          // We have a newer version locally, send this to the remote
          remoteUpdateMap[domain] = localToRemote(match.local)
        } else if (match.remote.history.includes(match.local.rev)) {
          // They have a newer version remotely, replace the local version
          localUpdates.push(remoteToLocal(domain, match.remote, userId, match.local.id))
        } else {
          // There's a conflict, put our version in the "rejected" list
          conflictMap[domain] = localToRemote(match.local)
        }
      }
    })

    const output = {
      accepted: localUpdates.map(site => site.domain),
      changed: remoteUpdateMap,
      rejected: conflictMap
    }

    if (localUpdates.length) {
      let promise

      // Note that this uses db.Site.sequelize instead of db.sequelize to ensure we get the right
      // dialect when running tests with sequelize-mocking
      if (db.Site.sequelize.getDialect() === 'mysql') {
        // Only MySQL supports the updateOnDuplicate option
        promise = db.Site.bulkCreate(localUpdates, {
          updateOnDuplicate: true,
          transaction: options.transaction
        })
      } else {
        promise = Promise.all(localUpdates.map(update => db.Site.upsert(update, {
          transaction: options.transaction
        })))
      }

      return promise.then(() => output)
    }

    return output
  })
}

function localToRemote (localSettings) {
  return Object.assign(localSettings.toJSON(), {
    id: undefined,
    userId: undefined,
    domain: undefined
  })
}

function remoteToLocal (domain, remoteSettings, userId, localId) {
  return Object.assign({}, remoteSettings, {
    id: localId,
    userId,
    domain,
    updatedAt: undefined,
    createdAt: undefined
  })
}

module.exports = siteService
