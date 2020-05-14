const _validate = require('../_validate')

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
      message
    },
    {
      headers: {
        'x-etvas-context': contextId
      }
    }
  )
  return response.status === 204
}
