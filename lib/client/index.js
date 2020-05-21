const { createHash } = require('crypto')

const config = require('../init/config')
const cache = require('../utils/cache')
const readData = require('./readData')
const writeData = require('./writeData')
const sendEmail = require('./sendEmail')
const validateToken = require('./validateToken')
const getProfile = require('./getProfile')

const client = function (token) {
  const xhr = config.get('xhr')
  const validate = async () => validateToken(xhr, token)
  const tokenCacheKey = createHash('sha256').update(token).digest('base64')
  const read = async () => {
    const { contextId } = await cache.read(tokenCacheKey, validate)
    if (!contextId) {
      throw new Error('[ETVAS] Token Read: invalid context')
    }
    return readData(xhr, contextId)
  }
  const write = async value => {
    const { contextId } = await cache.read(tokenCacheKey, validate)
    if (!contextId) {
      throw new Error('[ETVAS] Token Read: invalid context')
    }
    return writeData(xhr, contextId, value)
  }
  const getCustomerProfile = async () => {
    const { contextId } = await cache.read(tokenCacheKey, validate)
    if (!contextId) {
      throw new Error('[ETVAS] Token Read: invalid context')
    }
    return getProfile(xhr, contextId)
  }
  const sendEmailNotification = async data => {
    const { contextId } = await cache.read(tokenCacheKey, validate)
    if (!contextId) {
      throw new Error('[ETVAS] Token Read: invalid context')
    }
    return sendEmail(xhr, contextId, data)
  }
  return {
    validate,
    getCustomerProfile,
    sendEmailNotification,
    read,
    write
  }
}

client.read = async key => readData(config.get('xhr'), key)
client.write = async (key, value) => writeData(config.get('xhr'), key, value)
client.getCustomerProfile = async contextId =>
  getProfile(config.get('xhr'), contextId)
client.sendEmailNotification = async (contextId, data) =>
  sendEmail(config.get('xhr'), contextId, data)

module.exports = client
