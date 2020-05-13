const _validate = require('../_validate')

const CONTEXT = 'getCustomerProfile'

module.exports = async (xhr, contextId) => {
  _validate({ xhr, contextId }, CONTEXT)

  const { data } = await xhr.get('/user/profile', {
    headers: {
      'x-etvas-context': contextId
    }
  })

  if (data) {
    return {
      contextId,
      ...data
    }
  }

  return null
}
