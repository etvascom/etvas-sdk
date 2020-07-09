const init = require('./init/init')
const client = require('./client')
const events = require('./events')
const config = require('./init/config')
const hmac = require('./utils/hmac')
const pak = require('../package.json')

module.exports = {
  init,
  getConfig: config.all,
  hmac: {
    sign: canonical => hmac.sign(canonical, config.get('eventSecret')),
    verify: (canonical, signature) =>
      hmac.verify(canonical, signature, config.get('eventSecret'))
  },
  client,
  events,
  version: pak.version
}
