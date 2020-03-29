const Mongodb = require('./db/strategies/mongodb/mongodb')
const HeroSchema = require('./db/strategies/mongodb/schemas/heroisSchema')
const Postgres = require('./db/strategies/postgres/postgres')
const UserSchema = require('./db/strategies/postgres/schemas/usersSchema')
const Context = require('./db/strategies/base/contextStrategy')

const HeroRoutes = require('./routes/heroRoutes')
const AuthRoutes = require('./routes/authRoutes')
const UtilRoutes = require('./routes/utilRoutes')

const { config } = require('dotenv')
const { join } = require('path')

if (process.env.NODE_ENV) {
  const configPath = join(__dirname, './config', `.env.${process.env.NODE_ENV}`)

  config({
    path: configPath,
  })
}

const Hapi = require('hapi')
const HapiSwagger = require('hapi-swagger')
const Inert = require('inert')
const Vision = require('vision')
const HapiJwt = require('hapi-auth-jwt2')

const JWT_SECRET = process.env.JWT_KEY

const app = new Hapi.Server({
  port: process.env.PORT,
})

function mapRoutes(instance, methods) {
  return methods.map((method) => instance[method]())
}

async function main() {
  const connectionMongodb = Mongodb.connect()
  const MongodbContext = new Context(new Mongodb(HeroSchema, connectionMongodb))

  const connectionPostgres = await Postgres.connect()
  const model = await Postgres.defineModel(connectionPostgres, UserSchema)
  const ContextPostgres = new Context(new Postgres(connectionPostgres, model))

  const swaggerOptions = {
    info: {
      title: 'API Heroes',
      version: 'v1.0',
    },
  }

  await app.register([
    HapiJwt,
    Vision,
    Inert,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ])

  app.auth.strategy('jwt', 'jwt', {
    key: JWT_SECRET,
    validate: async (dado, request) => {
      const [result] = await ContextPostgres.read({
        username: dado.username.toLowerCase(),
      })

      if (!dado.Test && !result) {
        return {
          isValid: false,
        }
      }

      return {
        isValid: true,
      }
    },
  })

  app.auth.default('jwt')
  app.route([
    ...mapRoutes(new HeroRoutes(MongodbContext), HeroRoutes.methods()),
    ...mapRoutes(
      new AuthRoutes(JWT_SECRET, ContextPostgres),
      AuthRoutes.methods(),
    ),
    ...mapRoutes(new UtilRoutes(), UtilRoutes.methods()),
  ])

  await app.start()
  return app
}

module.exports = main()
