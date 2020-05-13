const PREFIX = '[ETVAS]'

const validations = {
  xhr: (value, context) => {
    if (!value) {
      throw new Error(`${PREFIX} ${context} error: Call init first!`)
    }
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
          context
        )})`
      )
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
