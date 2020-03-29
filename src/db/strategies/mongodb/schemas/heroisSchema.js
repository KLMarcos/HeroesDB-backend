const Mongoose = require('mongoose')

const heroeSchema = new Mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  poder: {
    type: String,
    require: true,
  },
  insertedAt: {
    type: Date,
    default: new Date(),
  },
})

module.exports = Mongoose.model('heroes', heroeSchema)
