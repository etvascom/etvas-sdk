const _validate = require('../_validate')
const { getQueryString } = require('../utils/queryString')

const CONTEXT = 'getPurchaseDetails'

module.exports = async (xhr, contextId, params = {}) => {
  _validate({ xhr, contextId }, CONTEXT)

  const { data } = await xhr.get(`/purchase${getQueryString(params)}`, {
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
