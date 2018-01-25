const Sequelize = require('sequelize')
const db = require('../db')
const User = require('../users/user.model')

const Site = db.define('sites',
  {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    domain: {
      type: Sequelize.STRING,
      allowNull: false
    },
    accessDate: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false
    },
    createDate: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false
    },
    deleteDate: {
      type: Sequelize.BIGINT.UNSIGNED
    },
    generation: {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false
    },
    pwLength: {
      type: Sequelize.TINYINT.UNSIGNED,
      allowNull: false
    },
    symbols: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    notes: {
      type: 'TEXT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
      allowNull: false
    },
    rev: {
      type: Sequelize.CHAR(8),
      allowNull: false
    },
    history: {
      // Comma-delimited string of revs
      type: Sequelize.TEXT,
      allowNull: false,
      get () {
        const val = this.getDataValue('history')
        return val == null ? val : val.split(',')
      },
      set (val) {
        if (Array.isArray(val)) {
          this.setDataValue('history', val.join(','))
        } else if (typeof val === 'string') {
          this.setDataValue('history', val)
        }
      }
    }
  },
  {
    charset: 'latin1',
    collate: 'latin1_swedish_ci',
    indexes: [{ fields: ['userId', 'domain'], unique: true }]
  }
)

Site.belongsTo(User, { onDelete: 'CASCADE' })
Site.sync()

module.exports = Site
