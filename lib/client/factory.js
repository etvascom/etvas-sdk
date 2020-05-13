/**
 * @module lib/client/factory
 */
const jwt = require('jsonwebtoken')

const _getTokenFromBearer = bearer => (bearer.indexOf('Bearer ') === 0 ? bearer.substr(7) : bearer)

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

const _validateKey = (key, operation) => {
  if (!key) {
    throw new Error(`Error on ${operation}: key cannot be empty`)
  }
  if (typeof key !== 'string') {
    throw new Error(`Error on ${operation}: key must be string, received ${typeof key}`)
  }
}

module.exports = xhr => {
  if (!xhr) {
    throw new Error('Underlying axios instance is empty')
  }
  const read = async key => {
    _validateKey(key)
    const { data } = await xhr.get(`/organizations/external-data/${key}`)
    if (!data || !data.data) {
      return null
    }
    return JSON.parse(data.data)
  }
  const write = async (key, value) => {
    _validateKey(key)
    const { data } = await xhr.put(`/organizations/external-data/${key}`, { data: JSON.stringify(value) })
    return !!data.data
  }
  const clear = async key => {
    _validateKey(key)
    const { data } = await xhr.delete(`/organizations/external-data/${key}`)
    return !!data.data
  }

  return {
    token: token => ({
      getProfile: async () => {
        const response = await xhr.get('/users/profile', _getBearerHeaders(token))
        return response.data
      },
      validate: async () => {
        const { data } = await xhr.get('/token/verify', _getBearerHeaders(token))
        return data === 'OK'
      },
      read: async () => read(_getPurchaseIdentifier(token)),
      write: async value => write(_getPurchaseIdentifier(token), value),
      clear: async () => clear(_getPurchaseIdentifier(token))
    }),
    read,
    write,
    clear
  }
}
