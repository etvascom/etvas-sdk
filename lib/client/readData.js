const _validate = require('../_validate')

const CONTEXT = 'readData'

module.exports = async (xhr, key) => {
  _validate({ xhr, key }, CONTEXT)
  const { data } = await xhr.get(`/external-data/${key}`)
  if (data) {
    return JSON.parse(data)
  }
  return null
}
