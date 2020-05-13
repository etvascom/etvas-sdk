const now = require('../_now')

const _cache = {}

const _stringRequired = key => {
  if (!key || typeof key !== 'string') {
    throw new Error(`Cache: invalid key: ${JSON.stringify(key)}`)
  }
}

const has = key => {
  _stringRequired(key)
  if (_cache[key] === undefined) {
    return false
  }
  const { expires } = _cache[key]
  const _now = now()
  if (expires > 0 && expires < _now) {
    return false
  }
  return true
}

const read = (key, defaultValue = null) => {
  if (!has(key)) {
    clear(key)
    return defaultValue
  }
  return _cache[key].value
}

const write = (key, value, expires = 0) => {
  _stringRequired(key)
  _cache[key] = {
    expires,
    value
  }
}

const clear = key => {
  if (typeof key === 'object' && key.all === true) {
    Object.keys(_cache).forEach(key => {
      delete _cache[key]
    })
    return
  }
  _stringRequired(key)
  delete _cache[key]
}

module.exports = {
  has,
  read,
  write,
  clear
}
