/**
 * @module lib/client/config
 */

const defaultOptions = {
  apiUrl: process.env.ETVAS_API_URL,
  apiKey: process.env.ETVAS_API_KEY,
  headerName: process.env.ETVAS_API_KEY_HEADER || 'x-api-key'
}

module.exports = options => ({ ...defaultOptions, ...options })
