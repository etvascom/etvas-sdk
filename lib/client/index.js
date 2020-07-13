const { createHash } = require('crypto')

const config = require('../init/config')
const cache = require('../utils/cache')
const readData = require('./readData')
const writeData = require('./writeData')
const sendEmail = require('./sendEmail')
const validateToken = require('./validateToken')
const productVariant = require('./productVariant')
const getProfile = require('./getProfile')
const _sendRawEmail = require('./_sendRawEmail')

const _validate = require('../_validate')

const client = function (token) {
  _validate({ token }, 'validateToken')
  const xhr = config.get('xhr')
  const validate = async () => validateToken(xhr, token)
  const tokenCacheKey = createHash('sha256').update(token).digest('base64')

  const getProductVariant = async () => {
    const response = await cache.read(tokenCacheKey, validate)
    return productVariant(response.productId)
  }

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
  const clear = async () => {
    const { contextId } = await cache.read(tokenCacheKey, validate)
    if (!contextId) {
      throw new Error('[ETVAS] Token Read: invalid context')
    }
    return writeData(xhr, contextId, null)
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
    getProductVariant,
    getCustomerProfile,
    sendEmailNotification,
    read,
    write,
    clear
  }
}

client.read = async key => readData(config.get('xhr'), key)
client.write = async (key, value) => writeData(config.get('xhr'), key, value)
client.clear = async key => writeData(config.get('xhr'), key, null)
/* istanbul ignore next */
client.getCustomerProfile = async contextId =>
  getProfile(config.get('xhr'), contextId)
/* istanbul ignore next */
client.sendEmailNotification = async (contextId, data) =>
  sendEmail(config.get('xhr'), contextId, data)
client.getProductVariant = productId => productVariant(productId)
client._sendRawEmail = payload => _sendRawEmail(config.get('xhr'), payload)
module.exports = client
