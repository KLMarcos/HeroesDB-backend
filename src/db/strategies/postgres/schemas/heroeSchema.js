const Sequelize = require('sequelize')

const HeroiSchema = {
  name: 'heroes',
  schema: {
    id: {
      type: Sequelize.INTEGER,
      require: true,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: Sequelize.STRING,
      require: true,
    },
    poder: {
      type: Sequelize.STRING,
      require: true,
    },
  },
  options: {
    tableName: 'TB_HEROES',
    freezeTableName: false,
    timestamps: false,
  },
}

module.exports = HeroiSchema
