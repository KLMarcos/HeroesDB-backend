const assert = require('assert')
const Mongodb = require('./../db/strategies/mongodb/mongodb')
const HeroiSchema = require('./../db/strategies/mongodb/schemas/heroisSchema')
const Context = require('./../db/strategies/base/contextStrategy')

const MOCK_HEROI_CADASTRAR = {
  nome: 'Gavião Arqueiro',
  poder: 'Flechas',
}

const MOCK_HEROI_READ = {
  nome: `Batman - ${Date.now()}`,
  poder: 'Dinheiro',
}

const MOCK_HEROI_ATUALIZAR = {
  nome: 'Homem Aranha',
  poder: 'Super teia',
}

let MOCK_HEROI_ID = ''

let context = {}

describe('Mongodb Strategy', function() {
  this.timeout(Infinity)
  this.beforeAll(async () => {
    const connection = Mongodb.connect()
    context = new Context(new Mongodb(HeroiSchema, connection))

    await context.create(MOCK_HEROI_READ)
    const result = await context.create(MOCK_HEROI_ATUALIZAR)
    MOCK_HEROI_ID = result._id
  })

  it('Verifica se a conexão com o DB Mongodb foi estabelecida', async () => {
    const expected = 'Connected'
    const result = await context.isConnected()
    assert.deepEqual(result, expected)
  })

  it('Cadastrar um heroi no DB Mongodb', async () => {
    const { nome, poder } = await context.create(MOCK_HEROI_CADASTRAR)

    assert.deepEqual(
      {
        nome,
        poder,
      },
      MOCK_HEROI_CADASTRAR,
    )
  })

  it('Listar os herois no DB Mongodb', async () => {
    const [{ nome, poder }] = await context.read({
      nome: MOCK_HEROI_READ.nome,
    })

    assert.deepEqual(
      {
        nome,
        poder,
      },
      MOCK_HEROI_READ,
    )
  })

  it('Atualizar um heroi no DB Mongodb', async () => {
    const novoNome = 'Perna Longa'

    await context.update(MOCK_HEROI_ID, {
      nome: novoNome,
    })

    const [novoItem] = await context.read({
      _id: MOCK_HEROI_ID,
    })

    assert.deepEqual(
      {
        nome: novoItem.nome,
        poder: novoItem.poder,
      },
      {
        ...MOCK_HEROI_ATUALIZAR,
        nome: novoNome,
      },
    )
  })

  it('Remover um heroi no DB Mongodb', async () => {
    const result = await context.delete(MOCK_HEROI_ID)

    assert.deepEqual(result.n, 1)
  })
})
