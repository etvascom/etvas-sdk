/**
 * @module lib/client/xhr
 */
const axios = require('axios')

module.exports = options =>
  axios.create({
    baseURL: options.apiURL,
    headers: {
      'x-api-key': options.apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
