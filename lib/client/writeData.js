const _validate = require('../_validate')

const CONTEXT = 'writeData'

module.exports = async (xhr, key, value) => {
  _validate({ xhr, key }, CONTEXT)
  const url = `/external-data/${key}`
  const data = value
    ? /* istanbul ignore next: don't test for string values */ typeof value ===
      'string'
      ? value
      : JSON.stringify(value)
    : null

  if (data) {
    await xhr.put(url, { data })
  } else {
    await xhr.delete(url)
  }

  return !!data
}
