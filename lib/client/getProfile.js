const _validate = require('../_validate')

const CONTEXT = 'getCustomerProfile'

module.exports = async (xhr, contextId) => {
  _validate({ xhr, contextId }, CONTEXT)
  const { data } = await xhr.get('/profile', {
    headers: {
      'x-context-id': contextId
    }
  })
  if (data) {
    return JSON.parse(data)
  }
  return null
}
