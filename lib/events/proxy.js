const eventNames = require('./names')
const config = require('../init/config')

const customHandlers = {}

const createProxyHandler = () => async (req, res) => {
  if (!req.body) {
    res.status(500).json({ error: 'Invalid implementation: missing json body parser' })
    throw new Error('Undefined request body. Maybe you forgot express.use(bodyParser.json()) ?')
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

  // check event name
  if (!eventNames[name]) {
    res.status(500).json({ error: `Unknown event name: ${name}` })
    throw new Error(`Unknown event received: ${name}`)
  }

  // do we have custom handler ?
  if (customHandlers[name]) {
    try {
      const response = await customHandlers[name](payload)
      if (response === true) {
        return res.status(204).send()
      }
      if (response === false) {
        return res.status(500).send()
      }
      return res.status(200).json(response)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
  // default: Not Yet Implemented
  return res.status(501).send()
}

// register a handler for an event
createProxyHandler.on = (eventName, eventHandler) => {
  if (!eventNames[eventName]) {
    throw new Error(`Subscribing to an unknown event ${eventName}`)
  }
  if (customHandlers[eventName]) {
    throw new Error(`Cannot register multiple handlers for one event: ${eventName}`)
  }
  customHandlers[eventName] = eventHandler
}

// unregister a handler for an event
createProxyHandler.off = eventName => {
  if (!eventNames[eventName]) {
    throw new Error(`Unsubscribing to an unknown event ${eventName}`)
  }
  if (!customHandlers[eventName]) {
    throw new Error(`No handler found for unsubscribing for event ${eventName}`)
  }
  delete customHandlers[eventName]
}

module.exports = createProxyHandler
