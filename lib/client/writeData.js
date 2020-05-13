const _validate = require('../_validate')

const CONTEXT = 'writeData'

module.exports = async (xhr, key, value) => {
  _validate({ xhr, key }, CONTEXT)

  const url = `/external-data/${key}`
  const { data } = value
    ? await xhr.put(url, { data: JSON.stringify(value) })
    : await xhr.delete(url)

  return !!data
}
