const config = require('../init/config')
const hmac = require('../utils/hmac')

// keep registered handlers stored at module level
const customHandlers = {}

/**
 * Helper function to register a handler to an event name
 * @param {string} name Name of the event
 * @param {function} handler Handler function
 */
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

/**
 * Helper function for unregister a [previously registered] handler for an event.
 *
 * @param {string} name Event name
 */
const _unregisterEventHandler = name => {
  if (typeof name !== 'string' || !name) {
    throw new Error(
      `Event name must be a non-empty string: ${JSON.stringify(name)}`
    )
  }
  delete customHandlers[name]
}

const _isAxiosError = err => err && err.response && err.response.status

/**
 * Main function
 * @example express.use('/events', etvas.events())
 */
const createProxyHandler = () => async (req, res) => {
  if (!req.body) {
    res
      .status(500)
      .json({ error: 'Invalid implementation: missing json body parser' })
    throw new Error(
      'Undefined request body. Maybe you forgot express.use(bodyParser.json()) ?'
    )
  }

  const signature = req.get('x-etvas-signature')
  if (!signature) {
    return res
      .status(400)
      .json({ error: 'Invalid request: missing signature header' })
  }

  const { name, payload, timestamp } = req.body
  // Always have a name
  if (!name) {
    return res.status(500).json({ error: 'Empty name' })
  }

  const now = Date.now()
  const oneMinute = 60000
  const timeLapse = config.get('eventTimeLapse') || oneMinute
  if (
    isNaN(timestamp) ||
    typeof timestamp !== 'number' ||
    timestamp <= 0 ||
    Math.abs(now - timestamp) > timeLapse
  ) {
    return res.status(400).json({ error: 'Event timestamp invalid' })
  }

  const hmacKey = config.get('eventSecret')

  const canonical =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  if (!hmac.verify(canonical, signature, hmacKey)) {
    return res.status(403).json({ error: 'Invalid signature' })
  }

  // do we have custom handler ?
  if (!customHandlers[name]) {
    // default: 501: Not Implemented
    return res.status(501).json({ error: 'Not implemented' })
  }

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
    if (_isAxiosError(err)) {
      return res.status(500).json({
        error: true,
        message: err.message,
        proxyHttpStatus: err.response.status,
        proxyHttpData: err.response.data
      })
    }
    return res.status(500).json({ error: err.message })
  }
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

// unregister a handler for an event
createProxyHandler.off = eventName => {
  const _eventNames = Array.isArray(eventName) ? eventName : [eventName]
  _eventNames.forEach(_unregisterEventHandler)
}

module.exports = createProxyHandler
