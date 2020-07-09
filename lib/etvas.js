const init = require('./init/init')
const client = require('./client')
const events = require('./events')
const config = require('./init/config')
const hmac = require('./utils/hmac')
const pak = require('../package.json')

module.exports = {
  init,
  getConfig: config.all,
  hmac,
  client,
  events,
  version: pak.version
}
