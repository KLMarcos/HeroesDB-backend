const assert = require('assert')
const api = require('./../api')
const Jwt = require('jsonwebtoken')

let app = {}

const headers = {
  Authorization: null,
}

const MOCK_HEROI_ATUALIZAR = {
  nome: 'Thor',
  poder: 'Martelo',
}

const MOCK_HEROI_CADASTRAR = {
  nome: 'Chapolin Colorado',
  poder: 'Marreta Biônica',
}

let MOCK_ID_ATUALIZAR = ''

describe('Tests for API Heroes', function() {
  this.beforeAll(async () => {
    headers.Authorization = Jwt.sign(
      {
        username: 'Test',
        Test: true,
      },
      process.env.JWT_KEY,
    )

    app = await api

    const result = await app.inject({
      method: 'POST',
      url: '/heroes',
      headers,
      payload: JSON.stringify(MOCK_HEROI_ATUALIZAR),
    })

    const dados = JSON.parse(result.payload)

    MOCK_ID_ATUALIZAR = dados._id
  })

  it('List heroes => /heroes', async () => {
    const result = await app.inject({
      method: 'GET',
      headers,
      url: '/heroes',
    })

    const dados = JSON.parse(result.payload)
    const statusCode = result.statusCode

    assert.deepEqual(statusCode, 200)
    assert.ok(Array.isArray(dados))
  })

  it('List only 3 records', async () => {
    const LIMIT = 3
    const result = await app.inject({
      method: 'GEt',
      headers,
      url: `/heroes?skip=0&limit=${LIMIT}`,
    })

    const dados = JSON.parse(result.payload)
    const statusCode = result.statusCode

    assert.deepEqual(statusCode, 200)
    assert.ok(dados.length <= LIMIT)
  })

  it('Get an error for invalid type of query params', async () => {
    const LIMIT_STRING = 'NOTNUMBER'
    const result = await app.inject({
      method: 'GEt',
      headers,
      url: `/heroes?skip=0&limit=${LIMIT_STRING}`,
    })

    const errorResult = {
      statusCode: 400,
      error: 'Bad Request',
      message: 'child "limit" fails because ["limit" must be a number]',
      validation: {
        source: 'query',
        keys: ['limit'],
      },
    }

    assert.deepEqual(result.payload, JSON.stringify(errorResult))
  })

  it('Search a record by name', async () => {
    const NAME = MOCK_HEROI_ATUALIZAR.nome
    const result = await app.inject({
      method: 'GET',
      headers,
      url: `/heroes?nome=${NAME}`,
    })

    const [heroe] = JSON.parse(result.payload)
    const statusCode = result.statusCode

    assert.equal(statusCode, 200)
    assert.equal(heroe.nome, NAME)
  })

  it('Register a hero', async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/heroes',
      headers,
      payload: JSON.stringify(MOCK_HEROI_CADASTRAR),
    })

    const statusCode = result.statusCode
    const { message, _id } = JSON.parse(result.payload)

    assert.ok(statusCode === 201)
    assert.notStrictEqual(_id, undefined)
    assert.deepEqual(message, 'Hero successfully registered')
  })

  it('Update a hero by id', async () => {
    const _id = MOCK_ID_ATUALIZAR

    const result = await app.inject({
      method: 'PATCH',
      url: `/heroes/${_id}`,
      headers,
      payload: JSON.stringify({
        poder: 'Raios e trovões',
      }),
    })

    const statusCode = result.statusCode
    const dados = JSON.parse(result.payload)

    assert.ok(statusCode === 200)
    assert.deepEqual(dados.message, 'Hero successfully updated')
  })

  it('Try to update a hero with an invalid id and get an error', async () => {
    const _id = '0a0000a0aaa0a0aaa0aa0000'
    const expected = {
      statusCode: 412,
      error: 'Precondition Failed',
      message: 'Id not found',
    }

    const result = await app.inject({
      method: 'PATCH',
      url: `/heroes/${_id}`,
      headers,
      payload: JSON.stringify({
        poder: 'Raios e trovões',
      }),
    })

    const dados = JSON.parse(result.payload)

    assert.deepEqual(dados, expected)
  })

  it('Delete an hero by id', async () => {
    const _id = MOCK_ID_ATUALIZAR
    const result = await app.inject({
      method: 'DELETE',
      headers,
      url: `/heroes/${_id}`,
    })

    const statusCode = result.statusCode
    const { message } = JSON.parse(result.payload)

    assert.ok(statusCode === 200)
    assert.deepEqual(message, 'Hero successfully deleted')
  })

  it('Try to delete an hero with an invalid id and et an error', async () => {
    const _id = '0a0000a0aaa0a0aaa0aa0000'
    const expected = {
      statusCode: 412,
      error: 'Precondition Failed',
      message: 'Id not found',
    }

    const result = await app.inject({
      method: 'DELETE',
      headers,
      url: `/heroes/${_id}`,
    })

    const dados = JSON.parse(result.payload)

    assert.deepEqual(dados, expected)
  })

  it('Gets an internal server error when something went wrong with the internal components', async () => {
    const _id = 'ID_INVALIDO'
    const expected = {
      error: 'Internal Server Error',
      message: 'An internal server error occurred',
      statusCode: 500,
    }

    const result = await app.inject({
      method: 'DELETE',
      headers,
      url: `/heroes/${_id}`,
    })

    const dados = JSON.parse(result.payload)

    assert.deepEqual(dados, expected)
  })
})
