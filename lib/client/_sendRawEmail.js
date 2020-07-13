const _validate = require('../_validate')
const formatRecipient = require('./stubs/formatRecipient')
const CONTEXT = '_sendRawEmail'

module.exports = async (xhr, { to, cc, bcc, subject, text }) => {
  _validate(
    {
      xhr,
      rawEmailTo: to,
      rawEmailCc: cc,
      rawEmailBcc: bcc,
      rawEmailSubject: subject,
      rawEmailText: text
    },
    CONTEXT
  )

  const data = {
    to: to.map(formatRecipient),
    subject,
    text
  }
  if (cc) {
    data.cc = cc.map(formatRecipient)
  }
  if (bcc) {
    data.bcc = bcc.map(formatRecipient)
  }

  const response = await xhr.post('/email/send', data)
  return response.status === 204
}
