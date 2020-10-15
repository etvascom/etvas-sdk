const _validate = require('../_validate')
const xhrFactory = require('../client/xhr')
const config = require('./config')

module.exports = options => {
  _validate(options, 'init')
  _validate(
    {
      apiURL: options.apiURL,
      apiKey: options.apiKey,
      eventSecret: options.eventSecret,
      productVariants: options.productVariants,
      reqSignatureSecret: options.reqSignatureSecret,
      debug: options.debug
    },
    'init'
  )
  config.set({ ...options, xhr: xhrFactory(options) })
}
