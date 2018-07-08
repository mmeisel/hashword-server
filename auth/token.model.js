module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('tokens',
    {
      token: {
        type: DataTypes.STRING(40),
        allowNull: false,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      clientId: {
        type: DataTypes.STRING(64),
        allowNull: false
      }
    },
    {
      charset: 'latin1',
      collate: 'latin1_swedish_ci'
    }
  )

  Token.associate = models => {
    Token.belongsTo(models.User, { onDelete: 'CASCADE' })
  }

  return Token
}
