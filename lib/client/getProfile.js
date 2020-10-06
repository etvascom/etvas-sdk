const _validate = require('../_validate')

const CONTEXT = 'getCustomerProfile'

module.exports = async (xhr, contextId, params = {}) => {
  _validate({ xhr, contextId }, CONTEXT)

  const qs = Object.keys(params)
    .map(field => `${encodeURI(field)}=${encodeURI(params[field])}`)
    .join('&')

  const { data } = await xhr.get(`/user/profile${qs ? `?${qs}` : ''}`, {
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
