/**
 * @module lib/client/xhr
 */
const axios = require('axios')

const _validateOptions = options => {
  if (!options.baseURL) {
    throw new Error('Cannot initialize client library without a baseURL')
  }
  if (!options.apiKey) {
    throw new Error('An Etvas API Key is needed')
  }
}

module.exports = options => {
  _validateOptions(options)

  return axios.create({
    baseURL: options.apiUrl,
    headers: {
      'x-api-key': options.apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}
