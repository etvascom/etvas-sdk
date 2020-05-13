const now = require('../now')

const _cache = {}

const has = key => {
  if (_cache[key] === undefined) {
    return false
  }
  const { expires } = _cache[key]
  if (expires > 0 && expires > now()) {
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

const write = (key, value, expires) => {
  _cache[key] = {
    expires,
    value
  }
}

const clear = key => {
  delete _cache[key]
}

module.exports = {
  has,
  read,
  write,
  clear
}
