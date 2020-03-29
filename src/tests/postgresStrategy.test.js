const assert = require('assert')
const Context = require('./../db/strategies/base/contextStrategy')
const Postgres = require('./../db/strategies/postgres/postgres')
const HeroeSchema = require('./../db/strategies/postgres/schemas/heroeSchema')

let context = {}

const MOCK_HEROI_CADASTRAR = {
  nome: 'Gavião Arqueiro',
  poder: 'Flechas',
}

const MOCK_HEROI_ATUALIZAR = {
  nome: 'Batman',
  poder: 'Dinheiro',
}

describe('Postgres Strategy', function() {
  this.timeout(Infinity)
  this.beforeAll(async () => {
    const connection = Postgres.connect()
    const model = await Postgres.defineModel(connection, HeroeSchema)

    context = new Context(new Postgres(connection, model))

    await context.delete()
    await context.create(MOCK_HEROI_ATUALIZAR)
  })

  it('Verifica se a conexão com o DB Postgres foi estabelecida', async () => {
    const result = await context.isConnected()
    assert.equal(result, true)
  })

  it('Cadastrar um heroi no DB Postgres', async () => {
    const result = await context.create(MOCK_HEROI_CADASTRAR)
    delete result.id
    assert.deepEqual(result, MOCK_HEROI_CADASTRAR)
  })

  it('Listar os herois no DB Postgres', async () => {
    const [result] = await context.read({
      nome: MOCK_HEROI_CADASTRAR.nome,
    })
    delete result.id
    assert.deepEqual(result, MOCK_HEROI_CADASTRAR)
  })

  it('Atualizar um heroi no DB Postgres', async () => {
    const [item] = await context.read({
      nome: MOCK_HEROI_ATUALIZAR.nome,
    })
    const dadosAtualizar = {
      ...MOCK_HEROI_ATUALIZAR,
      nome: 'Mulher Maravilha',
    }

    const [result] = await context.update(item.id, dadosAtualizar)
    const [itemAtualizado] = await context.read({
      id: item.id,
    })

    assert.deepEqual(result, 1)
    assert.deepEqual(itemAtualizado, {
      ...dadosAtualizar,
      id: item.id,
    })
  })

  it('Remover um heroi no DB Postgres', async () => {
    const [item] = await context.read()
    const result = await context.delete(item.id)

    assert.deepEqual(result, 1)
  })
})
