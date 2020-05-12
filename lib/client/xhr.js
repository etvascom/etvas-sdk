/**
 * @module lib/client/xhr
 */
const axios = require('axios')
const config = require('./config')

module.exports = (options) => {
  const cfg = config(options)
  return axios.create({
    baseURL: cfg.apiUrl,
    headers: {
      [cfg.headerName]: cfg.apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}
