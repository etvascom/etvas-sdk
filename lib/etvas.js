const init = require('./init/init')
const client = require('./client')
const events = require('./events')
const config = require('./init/config')
const pak = require('../package.json')

module.exports = {
  init,
  getConfig: config.all,
  client,
  events,
  version: pak.version
}
