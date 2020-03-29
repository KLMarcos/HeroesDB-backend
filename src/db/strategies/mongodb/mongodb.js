const ICrud = require('../interfaces/InterfaceCrud')
Mongoose = require('mongoose')
const STATUS = {
  0: 'Disconnected',
  1: 'Connected',
  2: 'Connecting',
  3: 'Disconnecting',
}

class MongoDB extends ICrud {
  static connect() {
    Mongoose.connect(
      process.env.MONGODB_URL,
      {
        useNewUrlParser: true,
      },
      (error) => {
        if (error) throw new Error(error)
      },
    )

    return Mongoose.connection
  }

  constructor(schema, connection) {
    super()
    this._connection = connection
    this._schema = schema
  }

  async isConnected() {
    const state = STATUS[this._connection.readyState]

    if (state === 'Connected') return state
    if (state === 'Connecting')
      await new Promise((resolve) => setTimeout(resolve, 5000))

    return STATUS[this._connection.readyState]
  }

  create(item) {
    return this._schema.create(item)
  }

  read(item, skip = 0, limit = 10) {
    return this._schema
      .find(item)
      .limit(limit)
      .skip(skip)
  }

  update(id, item) {
    return this._schema.updateOne(
      {
        _id: id,
      },
      {
        $set: item,
      },
    )
  }

  delete(id) {
    return this._schema.deleteOne({ _id: id })
  }
}

module.exports = MongoDB
