const _validate = require('../_validate')

const CONTEXT = 'validateToken'

module.exports = async (xhr, token) => {
  _validate({ xhr, token }, CONTEXT)
  const { data } = await xhr.post('/verify-token', { token })
  return data
}
