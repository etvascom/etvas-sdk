/**
 * @module lib/client/xhr
 */
const axios = require('axios')
const { prepareSignature } = require('./stubs/signRequest')

module.exports = options => {
  const instance = axios.create({
    baseURL: options.apiURL,
    headers: {
      'x-api-key': options.apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  instance.interceptors.request.use(config => {
    if (!options.reqSignatureSecret) {
      return config
    }
    const { timestamp, signature, canonical } = prepareSignature(
      config,
      options
    )
    config.headers['x-signature'] = signature
    config.headers['x-timestamp'] = timestamp
    config.data = canonical
    return config
  }, Promise.reject)

  return instance
}
