/* eslint-env mocha */

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const path = require('path')
const SequelizeMocking = require('sequelize-mocking')

const expect = chai.expect

chai.use(dirtyChai)

describe('siteService', () => {
  const db = require('../db')
  const service = require('./service')
  const testDataFile = path.resolve(__dirname, '../test/site-service-test-data.json')
  const exampleComLocalSettings = {
    history: ['00000000', '11111111'],
    id: undefined,
    userId: undefined,
    domain: undefined,
    accessDate: 1516754869000,
    createDate: 1516754869000,
    deleteDate: null,
    generation: 1,
    pwLength: 16,
    symbols: true,
    notes: '',
    rev: '22222222'
  }

  SequelizeMocking.sequelizeMockingMocha(db.sequelize, testDataFile, { logging: false })

  describe('#get()', () => {
    it('should return nothing for an invalid user', () => {
      return service.get(666).then(sites => expect(sites).to.be.an('array').that.is.empty())
    })

    it('should return domain and rev for all domains for a valid user', () => {
      return service.get(1).then(sites => {
        return expect(JSON.parse(JSON.stringify(sites))).to.have.deep.members([
          { domain: 'example.com', rev: '22222222' },
          { domain: 'deleted.com', rev: '22222222' },
          { domain: 'google.com', rev: '22222222' }
        ])
      })
    })

    it('should return domain and rev for valid, specified domains for a valid user', () => {
      return service.get(1, { domains: ['example.com', 'nonexistant.com'] }).then(sites => {
        return expect(JSON.parse(JSON.stringify(sites))).to.have.deep.members([
          { domain: 'example.com', rev: '22222222' }
        ])
      })
    })

    it('should return settings for all domains for a valid user', () => {
      return service.get(1, { includeSettings: true }).then(sites => {
        const rawSites = JSON.parse(JSON.stringify(sites))

        expect(rawSites).to.have.lengthOf(3)

        rawSites.forEach(site => {
          expect(site).to.have.property('pwLength').that.is.a('number')
          expect(site).to.have.property('generation').that.is.a('number')
          expect(site).to.have.property('symbols').that.is.a('boolean')
          expect(site).to.have.property('history').that.is.an('array')
        })
      })
    })

    it('should return settings for valid, specified domains for a valid user', () => {
      return service.get(1, { includeSettings: true, domains: ['example.com', 'nonexistant.com'] }).then(sites => {
        const rawSites = JSON.parse(JSON.stringify(sites))

        expect(rawSites).to.have.lengthOf(1)

        rawSites.forEach(site => {
          expect(site).to.have.property('pwLength').that.is.a('number')
          expect(site).to.have.property('generation').that.is.a('number')
          expect(site).to.have.property('symbols').that.is.a('boolean')
          expect(site).to.have.property('history').that.is.an('array')
        })
      })
    })
  })

  describe('#sync()', () => {
    it('should throw for an invalid user', done => {
      service.sync(666, {})
        .then(result => done(new Error('Result returned: ' + JSON.stringify(result))))
        .catch(err => {
          if (err.message === 'Invalid user') {
            done()
          } else {
            done(err)
          }
        })
    })

    it('should return a sync object for a valid user', () => {
      return service.sync(1, {}).then(result => {
        expect(result).to.have.property('accepted').that.is.an('array').that.is.empty()
        expect(result).to.have.property('rejected').that.is.an('object').that.is.empty()
        expect(result).to.have.property('changed').that.is.an('object').that.is.empty()
      })
    })

    it('should return local-only domains as changed', () => {
      return service.sync(1, { 'example.com': null }).then(result => {
        expect(result).to.deep.equal({
          accepted: [],
          rejected: {},
          changed: { 'example.com': exampleComLocalSettings }
        })
      })
    })

    it('should accept domains when the remote is newer', () => {
      const remoteData = {
        'example.com': {
          history: ['00000000', '11111111', '22222222', '33333333'],
          accessDate: new Date().getTime(),
          createDate: 1516754869000,
          deleteDate: null,
          generation: 2,
          pwLength: 16,
          symbols: true,
          notes: '',
          rev: '44444444'
        }
      }

      return service.sync(1, remoteData).then(result => {
        expect(result).to.deep.equal({
          accepted: ['example.com'],
          rejected: {},
          changed: {}
        })

        return db.Site.findOne({ where: { userId: 1, domain: 'example.com' } }).then(site => {
          expect(site).to.have.property('rev', '44444444')
          expect(site).to.have.property('generation', 2)
        })
      })
    })

    it('should change remote domains when the local is newer', () => {
      const remoteData = {
        'example.com': {
          history: ['00000000'],
          accessDate: 1516754869000,
          createDate: 1516754869000,
          deleteDate: null,
          generation: 1,
          pwLength: 16,
          symbols: true,
          notes: '',
          rev: '11111111'
        }
      }

      return service.sync(1, remoteData).then(result => {
        expect(result).to.deep.equal({
          accepted: [],
          rejected: {},
          changed: { 'example.com': exampleComLocalSettings }
        })
      })
    })

    it('should reject domains when there is a conflict', () => {
      const remoteData = {
        'example.com': {
          history: ['00000000', '12345678'],
          accessDate: 1516754869000,
          createDate: 1516754869000,
          deleteDate: null,
          generation: 1,
          pwLength: 16,
          symbols: true,
          notes: '',
          rev: '23456789'
        }
      }

      return service.sync(1, remoteData).then(result => {
        expect(result).to.deep.equal({
          accepted: [],
          rejected: { 'example.com': exampleComLocalSettings },
          changed: {}
        })
      })
    })

    it('should accept, reject, and change multiple domains correctly', () => {
      const remoteData = {
        'example.com': {
          history: ['00000000', '12345678'],
          accessDate: 1516754869000,
          createDate: 1516754869000,
          deleteDate: null,
          generation: 1,
          pwLength: 16,
          symbols: true,
          notes: '',
          rev: '23456789'
        },
        'google.com': {
          history: ['00000000', '11111111', '22222222'],
          accessDate: 1516754869000,
          createDate: 1516754869000,
          deleteDate: new Date().getTime(),
          generation: 1,
          pwLength: 16,
          symbols: true,
          notes: '',
          rev: '33333333'
        },
        'deleted.com': {
          history: ['00000000'],
          accessDate: 1516754869000,
          createDate: 1516754869000,
          deleteDate: null,
          generation: 1,
          pwLength: 16,
          symbols: true,
          notes: '',
          rev: '11111111'
        }
      }

      return service.sync(1, remoteData).then(result => {
        expect(result).to.deep.equal({
          accepted: ['google.com'],
          rejected: { 'example.com': exampleComLocalSettings },
          changed: {
            'deleted.com': {
              id: undefined,
              domain: undefined,
              userId: undefined,
              history: ['00000000', '11111111'],
              accessDate: 1516754869000,
              createDate: 1516754869000,
              deleteDate: 1516754869000,
              generation: 1,
              pwLength: 16,
              symbols: true,
              notes: '',
              rev: '22222222'
            }
          }
        })

        return db.Site.findOne({ where: { userId: 1, domain: 'google.com' } }).then(site => {
          expect(site).to.have.property('deleteDate').not.equal(null)
        })
      })
    })
  })
})
