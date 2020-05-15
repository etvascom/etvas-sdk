const _validate = require('../_validate')
const inlineCSS = require('./stubs/inline-css.json')

const _processInlineCSS = message =>
  Object.keys(inlineCSS).reduce((template, key) => {
    const re = new RegExp(` ?class ?= ?["']${key}["']`, 'gi')
    return template.replace(re, ` style="${inlineCSS[key]}"`)
  }, message)

const CONTEXT = 'sendEmailNotification'

module.exports = async (xhr, contextId, { locale, subject, message }) => {
  _validate(
    {
      xhr,
      contextId,
      notifyLocale: locale,
      notifySubject: subject,
      notifyMessage: message
    },
    CONTEXT
  )
  const response = await xhr.post(
    '/user/notify',
    {
      locale,
      subject,
      message: _processInlineCSS(message)
    },
    {
      headers: {
        'x-etvas-context': contextId
      }
    }
  )
  return response.status === 204
}
