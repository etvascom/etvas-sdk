const adapters = require('./adapters')
const now = require('./_now')

const config = {
  adapter: 'memory',
  decay: 600000 // 10 minutes
}

module.exports = options => {
  const cfg = { ...config, ...options }

  const adapter = adapters[cfg.adapter]

  const read = (key, factory, options = { expiresInterval: cfg.decay }) => {
    const { expiresInterval } = options
    if (!adapter.has(key) && factory) {
      adapter.write(
        key,
        factory(),
        expiresInterval > 0 ? now() + expiresInterval : 0
      )
    }
    return adapter.read(key)
  }

  const readAsync = async (
    key,
    factory,
    options = { expiresInterval: cfg.decay }
  ) => {
    const { expiresInterval } = options
    if (!adapter.has(key) && factory) {
      const value = await factory()
      adapter.write(
        key,
        value,
        expiresInterval > 0 ? now() + expiresInterval : 0
      )
    }
    return adapter.read(key)
  }

  return {
    has: adapter.has,
    read: readAsync,
    write: adapter.write,
    clear: adapter.clear,
    sync: {
      has: adapter.has,
      read,
      write: adapter.write,
      clear: adapter.clear
    }
  }
}
