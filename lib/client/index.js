const config = require('../init/config')
const cache = require('../utils/cache')
const readData = require('./readData')
const writeData = require('./writeData')
const validateToken = require('./validateToken')
const getProfile = require('./getProfile')

const client = function (token) {
  const xhr = config.get('xhr')
  const validate = async () => validateToken(xhr, token)
  const read = async () => {
    const { contextId } = await cache.read('token', validate)
    if (!contextId) {
      throw new Error('[ETVAS] Token Read: invalid context')
    }
    return readData(xhr, contextId)
  }
  const write = async value => {
    const { contextId } = await cache.read('token', validate)
    if (!contextId) {
      throw new Error('[ETVAS] Token Read: invalid context')
    }
    return writeData(xhr, contextId, value)
  }
  const getCustomerProfile = async () => {
    const { contextId } = await cache.read('token', validate)
    if (!contextId) {
      throw new Error('[ETVAS] Token Read: invalid context')
    }
    return getProfile(xhr, contextId)
  }
  return {
    validate,
    getCustomerProfile,
    read,
    write
  }
}

client.read = async key => readData(config.get('xhr'), key)
client.write = async (key, value) => writeData(config.get('xhr'), key, value)

module.exports = client
