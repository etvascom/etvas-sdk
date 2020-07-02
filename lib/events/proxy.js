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
    let variant
    const productVariants = config.get('productVariants')
    if (productVariants) {
      const { productId } = payload || {}

      if (productId && productVariants[productId]) {
        variant = productVariants[productId]
      }
    }

    try {
      const response = await customHandlers[name](payload, variant)
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

const _registerEventHandler = (name, handler) => {
  if (typeof name !== 'string' || !name) {
    throw new Error(
      `Event name must be a non-empty string: ${JSON.stringify(name)}`
    )
  }
  if (customHandlers[name] && customHandlers[name] !== handler) {
    throw new Error(`Cannot register multiple handlers for one event: ${name}`)
  }
  customHandlers[name] = handler
}

// register a handler for an event
createProxyHandler.on = (eventName, eventHandler) => {
  if (typeof eventHandler !== 'function') {
    throw new Error(`Event handler for ${eventName} must be a function`)
  }

  const _events = Array.isArray(eventName) ? eventName : [eventName]
  _events.forEach(name => _registerEventHandler(name, eventHandler))
}

createProxyHandler.alias = (name, otherEvents) => {
  if (!customHandlers[name]) {
    throw new Error(`Cannot add an alias for an unregistered event ${name}`)
  }
  const _events = Array.isArray(otherEvents) ? otherEvents : [otherEvents]
  const _handler = customHandlers[name]
  _events.forEach(alias => _registerEventHandler(alias, _handler))
}

const _unregisterEventHandler = name => {
  if (typeof name !== 'string' || !name) {
    throw new Error(
      `Event name must be a non-empty string: ${JSON.stringify(name)}`
    )
  }
  delete customHandlers[name]
}

// unregister a handler for an event
createProxyHandler.off = eventName => {
  const _eventNames = Array.isArray(eventName) ? eventName : [eventName]
  _eventNames.forEach(_unregisterEventHandler)
}

module.exports = createProxyHandler
