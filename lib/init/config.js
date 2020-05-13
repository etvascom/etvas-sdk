const config = {}

const setOption = (key, value) => (config[key] = value)
const getOption = key => config[key]

module.exports = {
  set: (options, value) => {
    if (typeof options === 'object' && value === undefined) {
      Object.keys(options).forEach(key => setOption(key, options[key]))
      return
    }
    setOption(options, value)
  },
  get: key => getOption(key),
  clear: () => {
    Object.keys(config).forEach(key => {
      delete config[key]
    })
  }
}
