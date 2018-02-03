const convict = require('convict')

require('dotenv').config()

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  database: {
    uri: {
      format: String,
      default: 'mysql://localhost/hashword',
      env: 'DATABASE_URI'
    },
    password: {
      format: String,
      default: '',
      env: 'DATABASE_PASSWORD',
      sensitive: true
    }
  },
  session: {
    maxAge: {
      format: 'nat',
      default: 86400000,
      env: 'SESSION_MAX_AGE'
    },
    secret: {
      format: String,
      default: null,
      env: 'SESSION_SECRET',
      sensitive: true
    }
  },
  google: {
    clientID: {
      format: String,
      default: null,
      env: 'GOOGLE_CLIENT_ID',
      sensitive: true
    },
    clientSecret: {
      format: String,
      default: null,
      env: 'GOOGLE_CLIENT_SECRET',
      sensitive: true
    }
  },
  github: {
    clientID: {
      format: String,
      default: null,
      env: 'GITHUB_CLIENT_ID',
      sensitive: true
    },
    clientSecret: {
      format: String,
      default: null,
      env: 'GITHUB_CLIENT_SECRET',
      sensitive: true
    }
  }
})

// Load and validate environment dependent configuration
const env = config.get('env')

config.loadFile('./config/' + env + '.json')
config.validate({ allowed: 'strict' })

module.exports = config.getProperties()
