class NotImplementedException extends Error {
  constructor() {
    super('Not implemneted Exeption.')
  }
}

class ICrud {
  create(item) {
    throw new NotImplementedException()
  }

  read(item) {
    throw new NotImplementedException()
  }

  update(id, item) {
    throw new NotImplementedException()
  }

  delete(id) {
    throw new NotImplementedException()
  }

  isConnected() {
    return new NotImplementedException()
  }

  connect() {
    return new NotImplementedException()
  }

  defineModel() {
    return new NotImplementedException()
  }
}

module.exports = ICrud
