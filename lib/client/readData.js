const _validate = require('../_validate')

const CONTEXT = 'readData'

module.exports = async (xhr, key) => {
  _validate({ xhr, key }, CONTEXT)
  const { data } = await xhr.get(`/external-data/${key}`)
  if (!data || !data.data) {
    return null
  }

  try {
    return JSON.parse(data.data)
  } catch (err) {
    console.warn('Saved data is not in JSON format')
    return data.data
  }
}
