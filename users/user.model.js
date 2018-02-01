module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('users',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      provider: {
        type: DataTypes.ENUM('github', 'google'),
        allowNull: false
      },
      providerId: {
        type: DataTypes.STRING(64),
        allowNull: false
      },
      name: {
        type: 'VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
        allowNull: false
      },
      email: {
        type: DataTypes.STRING
      }
    },
    {
      charset: 'latin1',
      collate: 'latin1_swedish_ci',
      indexes: [
        {
          fields: ['provider', 'providerId'],
          unique: true
        }
      ]
    }
  )

  User.associate = models => {
    User.hasMany(models.Site, { onDelete: 'CASCADE' })
  }

  return User
}
