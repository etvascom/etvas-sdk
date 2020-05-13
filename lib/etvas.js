const init = require('./init/init')
const client = require('./client')
const config = require('./init/config')
const pak = require('../package.json')

module.exports = {
  init,
  getConfig: config.all,
  client,
  version: pak.version
}
