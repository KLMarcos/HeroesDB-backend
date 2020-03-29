const assert = require('assert')
const API = require('./../api')
const Context = require('./../db/strategies/base/contextStrategy')
const Postgres = require('./../db/strategies/postgres/postgres')
const UserSchema = require('./../db/strategies/postgres/schemas/usersSchema')

const MOCK_USER = {
  username: 'TestUser',
  password: '321',
}

const MOCK_CRYPT_USER = {
  username: MOCK_USER.username.toLowerCase(),
  password: '$2a$04$PNov69ERC2hjX.2Rccy.8u9J.YDEjNYOOvq3m5qTxpI6VC3PT2F0O',
}

let app = {}

describe('Auth test suite', function() {
  this.beforeAll(async () => {
    app = await API

    const connectionPostgres = await Postgres.connect()
    const model = await Postgres.defineModel(connectionPostgres, UserSchema)
    const ContextPostgres = new Context(new Postgres(connectionPostgres, model))

    await ContextPostgres.update(null, MOCK_CRYPT_USER, true)
  })

  it('get a token', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/login',
      payload: MOCK_USER,
    })

    const statusCode = result.statusCode

    assert.deepEqual(statusCode, 200)
  })

  it('return Unauthorized when the login is invalid', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        username: 'unknown',
        password: 'unknown',
      },
    })

    const statusCode = result.statusCode
    const dados = JSON.parse(result.payload)

    assert.deepEqual(statusCode, 401)
    assert.deepEqual(dados.error, 'Unauthorized')
  })

  it('should unregister an user', async () => {
    const result = await app.inject({
      method: 'DELETE',
      url: '/unregister',
      payload: MOCK_USER,
    })

    const statusCode = result.statusCode

    assert.deepEqual(statusCode, 204)
  })
})
