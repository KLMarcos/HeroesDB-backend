const BaseRoute = require('./base/baseRoute')
const Joi = require('joi')
const Boom = require('boom')
const Jwt = require('jsonwebtoken')
const PasswordHelper = require('./../helpers/passwordHelper')

function failAction(request, headers, error) {
  throw error
}

class AuthRoutes extends BaseRoute {
  constructor(secret, db) {
    super()
    this._secret = secret
    this._db = db
  }

  login() {
    return {
      path: '/login',
      method: 'POST',
      config: {
        auth: false,
        tags: ['api'],
        description: 'Get a JWT token',
        notes: 'return the token for the user login',
        validate: {
          failAction,
          payload: {
            username: Joi.string().required(),
            password: Joi.string().required(),
          },
        },
      },
      handler: async (request) => {
        const { username, password } = request.payload

        const [user] = await this._db.read({
          username: username.toLowerCase(),
        })

        if (!user) {
          return Boom.unauthorized('User does not exists!')
        }

        const match = await PasswordHelper.comparePassword(
          password,
          user.password,
        )

        if (!match) {
          return Boom.unauthorized('Incorrect user or password!')
        }

        const token = Jwt.sign(
          {
            username: username,
            id: user.id,
          },
          this._secret,
        )

        return {
          token,
        }
      },
    }
  }

  unregister() {
    return {
      path: '/unregister',
      method: 'DELETE',
      config: {
        auth: false,
        tags: ['api'],
        description: 'Remove a registerd user',
        notes: 'The user will not be able to lgin anymore',
        validate: {
          failAction,
          payload: {
            username: Joi.string().required(),
            password: Joi.string().required(),
          },
        },
      },
      handler: async (request, header) => {
        const { username, password } = request.payload

        const [user] = await this._db.read({
          username: username.toLowerCase(),
        })

        if (!user) {
          return Boom.unauthorized('User does not exists!')
        }

        const match = await PasswordHelper.comparePassword(
          password,
          user.password,
        )

        if (!match) {
          return Boom.unauthorized('Incorrect user or password!')
        }

        const result = await this._db.delete(user.id)
        if (result !== 1) {
          return Boom.preconditionFailed('Id not found')
        } else {
          return header.response().code(204)
        }
      },
    }
  }
}

module.exports = AuthRoutes
