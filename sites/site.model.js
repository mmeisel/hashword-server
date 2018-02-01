module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define('sites',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      domain: {
        type: DataTypes.STRING,
        allowNull: false
      },
      accessDate: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      createDate: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      deleteDate: {
        type: DataTypes.BIGINT.UNSIGNED
      },
      generation: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      pwLength: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false
      },
      symbols: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      notes: {
        type: 'TEXT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci',
        allowNull: false
      },
      rev: {
        type: DataTypes.CHAR(8),
        allowNull: false
      },
      history: {
        // Comma-delimited string of revs
        type: DataTypes.TEXT,
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

  return Site
}
