const PREFIX = '[ETVAS]'

const validations = {
  xhr: (value, context) => {
    if (!value) {
      throw new Error(`${PREFIX} ${context} error: Call init first!`)
    }
    const verbs = ['get', 'post', 'put', 'patch', 'delete', 'options']
    verbs.forEach(verb => {
      if (typeof value[verb] !== 'function') {
        throw new Error(`${PREFIX} ${context} error: invalid axios instance`)
      }
    })
  },
  key: (value, context) => {
    if (!value || typeof value !== 'string' || value.length > 64) {
      throw new Error(
        `${PREFIX} ${context} error: key must be a non-empty string`
      )
    }
  },
  token: (value, context) => {
    if (!value || typeof value !== 'string') {
      throw new Error(
        `${PREFIX} ${context} error: token must be non-empty string`
      )
    }
  },
  options: (value, context) => {
    if (!value || typeof value !== 'object') {
      throw new Error(`${PREFIX} ${context} error: invalid options`)
    }
  },
  apiURL: (value, context) => {
    if (!value || typeof value !== 'string') {
      throw new Error(`${PREFIX} ${context} error: invalid apiUrl`)
    }
  },
  apiKey: (value, context) => {
    if (!value || typeof value !== 'string' || value.length < 4) {
      throw new Error(
        `${PREFIX} ${context} error: invalid apiKey (${JSON.stringify(value)})`
      )
    }
  },
  contextId: (value, context) => {
    if (!value || typeof value !== 'string') {
      throw new Error(
        `${PREFIX} ${context} error: invalid x-context-id (${JSON.stringify(
          value
        )})`
      )
    }
  },
  notifyLocale: (value, context) => {
    if (!value || typeof value !== 'string' || !/^[a-z]{2}$/.test(value)) {
      throw new Error(`${PREFIX} ${context} error: invalid locale`)
    }
  },
  notifySubject: (value, context) => {
    if (!value || typeof value !== 'string') {
      throw new Error(`${PREFIX} ${context} error: invalid subject`)
    }
  },
  notifyMessage: (value, context) => {
    if (!value || typeof value !== 'string') {
      throw new Error(`${PREFIX} ${context} error: invalid message`)
    }
  }
}

module.exports = (values, context) =>
  Object.keys(values).forEach(type => {
    if (!validations[type]) {
      throw new Error(`Cannot validate ${JSON.stringify(type)}`)
    }
    validations[type](values[type], context)
  })
