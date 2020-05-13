const _validate = require('../_validate')
const xhrFactory = require('../client/xhr')
const config = require('./config')

module.exports = options => {
  _validate(options, 'init')
  _validate({ apiURL: options.apiURL, apiKey: options.apiKey }, 'init')
  config.set({ ...options, xhr: xhrFactory(options) })
}
