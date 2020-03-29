const Sequelize = require('sequelize')
const ICrud = require('./../interfaces/InterfaceCrud')

class Postgres extends ICrud {
  constructor(connection, schema) {
    super()
    this._connection = connection
    this._schema = schema
  }

  static async defineModel(connection, schema) {
    const model = connection.define(schema.name, schema.schema, schema.options)

    await model.sync()
    return model
  }

  static connect() {
    return new Sequelize(process.env.DATABASE_URL, {
      operationAliases: false,
      logging: false,
      quoteIdentifiers: false,
      ssl: process.env.SSL_DB,
      dialectOptions: {
        ssl: process.env.SSL_DB,
      },
    })
  }

  async isConnected() {
    try {
      await this._connection.authenticate()
      return true
    } catch (error) {
      throw new Error(error)
      return false
    }
  }

  async create(item) {
    const { dataValues } = await this._schema.create(item)
    return dataValues
  }

  read(item) {
    return this._schema.findAll({
      where: item,
      raw: true,
    })
  }

  update(id, item, upsert = false) {
    const updateFunction = upsert ? 'upsert' : 'update'
    return this._schema[updateFunction](item, {
      where: {
        id: id,
      },
    })
  }

  delete(id) {
    const query = id
      ? {
          id,
        }
      : {}
    return this._schema.destroy({
      where: query,
    })
  }
}

module.exports = Postgres
