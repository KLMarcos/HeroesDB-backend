const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')

function failAction(request, headers, error) {
  throw error
}

const headers = Joi.object({
  authorization: Joi.string().required(),
}).unknown()

class HeroRoutes extends BaseRoute {
  constructor(db) {
    super()
    this.db = db
  }

  list() {
    return {
      path: '/heroes',
      method: 'GET',
      config: {
        tags: ['api'],
        description: 'List the registered heroes',
        notes: 'Result can be paginated and filtered by name',
        validate: {
          // payload -> body
          // headers -> header
          // params -> url params
          // query -> query params
          failAction,
          headers,
          query: {
            skip: Joi.number()
              .integer()
              .default(0),
            limit: Joi.number()
              .integer()
              .default(10),
            nome: Joi.string()
              .min(1)
              .max(100),
          },
        },
      },
      handler: (request, header) => {
        try {
          const { skip, limit, nome } = request.query

          const query = {
            nome: {
              $regex: nome ? `.*${nome}.*` : '.*',
            },
          }

          return this.db.read(query, skip, limit)
        } catch (error) {
          return Boom.internal()
        }
      },
    }
  }

  create() {
    return {
      path: '/heroes',
      method: 'POST',
      config: {
        tags: ['api'],
        description: 'Register an hero',
        notes: 'Heroes can be registered by posting the defined object',
        validate: {
          failAction,
          headers,
          payload: {
            nome: Joi.string()
              .required()
              .min(3)
              .max(100),
            poder: Joi.string()
              .required()
              .min(3)
              .max(100),
          },
        },
      },
      handler: async (request, header) => {
        try {
          const { nome, poder } = request.payload

          const result = await this.db.create({
            nome,
            poder,
          })

          return header
            .response({
              message: 'Hero successfully registered',
              _id: result._id,
            })
            .code(201)
        } catch (error) {
          return Boom.internal()
        }
      },
    }
  }

  update() {
    return {
      path: '/heroes/{id}',
      method: 'PATCH',
      config: {
        tags: ['api'],
        description: 'Update data for an existing hero by id',
        notes: 'The hero id must be valid and existent',
        validate: {
          failAction,
          headers,
          params: {
            id: Joi.string().required(),
          },
          payload: {
            nome: Joi.string()
              .min(3)
              .max(100),
            poder: Joi.string()
              .min(3)
              .max(100),
          },
        },
      },
      handler: async (request, header) => {
        try {
          const { id } = request.params

          const { payload } = request

          const dados = JSON.parse(JSON.stringify(payload))
          const result = await this.db.update(id, dados)

          if (result.nModified !== 1) {
            return Boom.preconditionFailed('Id not found')
          } else {
            return header
              .response({
                message: 'Hero successfully updated',
              })
              .code(200)
          }
        } catch (error) {
          return Boom.internal()
        }
      },
    }
  }

  delete() {
    return {
      path: '/heroes/{id}',
      method: 'DELETE',
      config: {
        tags: ['api'],
        description: 'Remove an registered hero by id',
        notes: 'The hero id must be valid and existent',
        validate: {
          failAction,
          headers,
          params: {
            id: Joi.string().required(),
          },
        },
      },
      handler: async (request, header) => {
        try {
          const { id } = request.params

          const result = await this.db.delete(id)

          if (result.n !== 1) {
            return Boom.preconditionFailed('Id not found')
          } else {
            return header
              .response({
                message: 'Hero successfully deleted',
              })
              .code(200)
          }
        } catch (error) {
          return Boom.internal()
        }
      },
    }
  }
}

module.exports = HeroRoutes
