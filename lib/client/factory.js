/**
 * @module lib/client/factory
 */

const buildXhr = require('./xhr')
const jwt = require('jsonwebtoken')

const _getTokenFromBearer = bearer => bearer.indexOf('Bearer ') === 0 ? bearer.substr(7) : bearer

const _getPurchaseIdentifier = bearer => {
  const decoded = jwt.decode(_getTokenFromBearer(bearer))
  if (!decoded || !decoded.purId) {
    throw new Error('Invalid bearer token')
  }
  return decoded.purId
}

const _getBearerHeaders = bearer => ({
  headers: {
    Authorization: _getTokenFromBearer(bearer)
  }
})

/**
 * Creates an ETVAS client, for easy communication with ETVAS Servers
 *
 * @param {Object} [options = {}] Configuration options
 * @param {string} [options.apiUrl = process.env.ETVAS_API_URI] The API Url
 * @param {string} [options.apiKey = process.env.ETVAS_API_KEY] The API Key
 * @param {string} [options.headerName = process.env.ETVAS_API_KEY_HEADER || 'x-api-key'] The Request Header name (defaults to process.env.ETVAS_API_KEY_HEADER or 'x-api-key')
 * @returns {object} An object containing specific functions for connecting to ETVAS Servers
 */
module.exports = options => {
  const xhr = buildXhr(options || {})

  /**
   * Gets the customer profile
   *
   * @param {string} bearer The token you received in URL
   * @returns {object} The customer profile
   */
  const getCustomerProfile = async bearer => {
    const response = await xhr.get('/users/profile', _getBearerHeaders(bearer))
    return response.data
  }

  /**
   * Validates the token against ETVAS Backend Servers
   * @param {string} bearer The token you received in URL
   * @returns {boolean} True if the token is valid, false otherwise
   */
  const validateToken = async bearer => {
    const response = await xhr.get('/token/verify', _getBearerHeaders(bearer))
    return response && response.data && response.data === 'OK'
  }

  /**
   * Gets an object previously stored under key
   * @param {string} key The key you wish to read data from
   * @returns {object|null} The stored data as an object
   */
  const getExternalData = async key => {
    const response = await xhr.get(`/organizations/external-data/${key}`)
    const data = response.data.data
    return data ? JSON.parse(data) : data
  }

  /**
   * Saves an object under a key on ETVAS Servers
   * @param {string} key The key that identifies the data
   * @param {object} value The value you wish to store (max 100k json-encoded)
   */
  const putExternalData = async (key, value) => {
    const data = value ? JSON.stringify(value) : null
    const response = await xhr.put(`/organizations/external-data/${key}`, { data })
    return !!response.status
  }

  /**
   * Reads an arbitrary object previously attached to a purchase
   *
   * @param {string} bearer The token you received in URL
   * @returns {object} The stored data
   */
  const getExternalPurchaseData = async bearer => getExternalData(_getPurchaseIdentifier(bearer))

  /**
   * Saves an arbitrary object linked to the purchase identified by token
   *
   * @param {string} bearer The token you received in URL
   * @param {object} value The object to be stored
   */
  const putExternalPurchaseData = async (bearer, value) => putExternalData(_getPurchaseIdentifier(bearer), value)

  return {
    getCustomerProfile,
    validateToken,
    getExternalData,
    putExternalData,
    getExternalPurchaseData,
    putExternalPurchaseData
  }
}
