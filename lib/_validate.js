const PREFIX = '[ETVAS]'
const validateEmail = require('./client/stubs/validateEmail')

const _validateEmailRecipient = value => {
  if (!value) {
    return false
  }
  const email = typeof value === 'string' ? value : value.email
  return validateEmail(email)
}

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
  eventSecret: (value, context) => {
    if (!value || typeof value !== 'string') {
      throw new Error(
        `${PREFIX} ${context} error: invalid eventSecret (${JSON.stringify(
          value
        )})`
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
  },
  productVariants: (value, context) => {
    // optional
    if (!value) {
      return
    }
    if (typeof value !== 'object') {
      throw new Error(
        `${PREFIX} ${context} error: product variants should be an object`
      )
    }
    if (Object.keys(value).length === 0) {
      throw new Error(
        `${PREFIX} ${context} error: supplied product variants is empty`
      )
    }
  },
  rawEmailTo: (value, context) => {
    if (!value || !Array.isArray(value)) {
      throw new Error(
        `${PREFIX} ${context} error: TO recipients must be an array`
      )
    }
    if (!value.length) {
      throw new Error(
        `${PREFIX} ${context} error: TO recipients must be a non-empty array`
      )
    }
    const valid = value.every(_validateEmailRecipient)
    if (!valid) {
      throw new Error(`${PREFIX} ${context} error: invalid TO recipient`)
    }
  },
  rawEmailCc: (value, context) => {
    if (!value || (Array.isArray(value) && !value.length)) {
      /// optional value
      return
    }
    value.every(recipient => {
      if (!_validateEmailRecipient(recipient)) {
        throw new Error(
          `${PREFIX} ${context} error: invalid CC recipient: ${JSON.stringify(
            recipient
          )}`
        )
      }
      return true
    })
  },
  rawEmailBcc: (value, context) => {
    if (!value || (Array.isArray(value) && !value.length)) {
      /// optional value
      return
    }
    value.every(recipient => {
      if (!_validateEmailRecipient(recipient)) {
        throw new Error(
          `${PREFIX} ${context} error: invalid BCC recipient: ${JSON.stringify(
            recipient
          )}`
        )
      }
      return true
    })
  },
  rawEmailSubject: (value, context) => {
    if (!value) {
      throw new Error(`${PREFIX} ${context} error: empty raw email subject`)
    }
    if (typeof value !== 'string') {
      throw new Error(
        `${PREFIX} ${context} error: raw email subject must be string`
      )
    }
    return true
  },
  rawEmailText: (value, context) => {
    if (!value) {
      throw new Error(`${PREFIX} ${context} error: empty raw email text`)
    }
    if (typeof value !== 'string') {
      throw new Error(
        `${PREFIX} ${context} error: raw email subject must be string`
      )
    }
    return true
  },
  reqSignatureSecret: (value, context) => {
    if (value === undefined) {
      // optional until 2.0
      return true
    }
    if (typeof value !== 'string') {
      throw new Error(
        `${PREFIX} ${context} error: empty request signature secret`
      )
    }

    return true
  },
  debug: (value, context) => {
    if (value === undefined) {
      return true
    }
    if (typeof value !== 'object') {
      throw new Error(`${PREFIX} ${context} error: invalid debug config`)
    }

    return true
  }
}

module.exports = (values, context) =>
  Object.keys(values).forEach(type => {
    if (!validations[type]) {
      throw new Error(`Cannot validate ${JSON.stringify(type)}`)
    }
    validations[type](values[type], context)
  })
