const config = require('../init/config')

const customHandlers = {}

const isAxiosError = err => err.response && err.response.status

const createProxyHandler = () => async (req, res) => {
  if (!req.body) {
    res
      .status(500)
      .json({ error: 'Invalid implementation: missing json body parser' })
    throw new Error(
      'Undefined request body. Maybe you forgot express.use(bodyParser.json()) ?'
    )
  }
  const { name, payload } = req.body

  // Always have a name
  if (!name) {
    return res.status(500).json({ error: 'Empty name' })
  }

  // check API key
  const receivedApiKey = req.get('x-api-key')
  if (!receivedApiKey || receivedApiKey !== config.get('apiKey')) {
    return res.status(500).json({ error: 'Invalid request' })
  }

  // do we have custom handler ?
  if (customHandlers[name]) {
    try {
      const response = await customHandlers[name](payload)
      if (response === true) {
        return res.status(204).send()
      }
      return res.status(200).json(response)
    } catch (err) {
      if (isAxiosError(err)) {
        return res.status(500).json({
          error: err.message,
          proxyHttpStatus: err.status,
          proxyHttpData: err.response.data
        })
      }
      return res.status(500).json({ error: err.message })
    }
  }
  // default: 501: Not Implemented
  return res.status(501).json({ error: 'Not implemented' })
}

// register a handler for an event
createProxyHandler.on = (eventName, eventHandler) => {
  if (typeof eventName !== 'string' || !eventName) {
    throw new Error(
      `Event name must be a non-empty string: ${JSON.stringify(eventName)}`
    )
  }
  if (typeof eventHandler !== 'function') {
    throw new Error(`Event handler for ${eventName} must be a function`)
  }
  if (customHandlers[eventName] && customHandlers[eventName] !== eventHandler) {
    throw new Error(
      `Cannot register multiple handlers for one event: ${eventName}`
    )
  }
  customHandlers[eventName] = eventHandler
}

// unregister a handler for an event
createProxyHandler.off = eventName => {
  if (typeof eventName !== 'string' || !eventName) {
    throw new Error(
      `Event name must be a non-empty string: ${JSON.stringify(eventName)}`
    )
  }
  delete customHandlers[eventName]
}

module.exports = createProxyHandler
