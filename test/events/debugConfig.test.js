const assert = require('assert').strict
const { describe, it, beforeEach, afterEach } = require('mocha')
const crypto = require('crypto')
const etvas = require('../../lib/etvas')
const config = require('../../lib/init/config')
const cache = require('../../lib/utils/cache')

const proxy = require('../../lib/events/proxy')
process.env.ETVAS_SDK_DEBUG = true
const _defaultOptions = {
  apiURL: 'https://localhost:1234',
  apiKey: '12345678',
  eventSecret: '12345678',
  reqSignatureSecret: '12345678',
  debug: {
    suppressIncomingSignatureCheck: true
  }
}
const _additionalOptions = {
  productVariants: {
    'key-1234': 'first',
    'key-2345': 'second'
  }
}
const _sign = (value, key = _defaultOptions.eventSecret) =>
  crypto.createHmac('sha256', key).update(value).digest('hex')

const TEST_EVENT_NAME = 'event.test.name'
const TEST_EVENT_ALIAS = 'event.test.alias'

class MockRes {
  constructor() {
    this._data = { status: null, json: null, sent: false }
  }

  status(value) {
    this._data.status = value
    return this
  }

  json(value) {
    this._data.json = value
    this._data.sent = true
    return this
  }

  send() {
    this._data.sent = true
    return this
  }
}

function MockReq(body) {
  this.body = body
}

describe('Debug Config', () => {
  beforeEach(() => {
    etvas.init({ ..._defaultOptions })
    cache.clear({ all: true })
  })
  afterEach(() => {
    config.clear()
    cache.clear({ all: true })
  })
  it('should be a function', () => {
    assert.strictEqual(typeof etvas.events, 'function')
  })
  it('should return a function', () => {
    assert.strictEqual(typeof etvas.events(), 'function')
  })
  it('should have a on function', () => {
    assert.strictEqual(typeof etvas.events.on, 'function')
  })
  it('should have an off function', () => {
    assert.strictEqual(typeof etvas.events.off, 'function')
  })
  it('should have an alias function', () => {
    assert.strictEqual(typeof etvas.events.alias, 'function')
  })
  describe('Event proxy', () => {
    beforeEach(() => {
      try {
        proxy.off(TEST_EVENT_NAME)
        proxy.off(TEST_EVENT_ALIAS)
      } catch (e) {}
    })
    it('should be a function', () => {
      assert.strictEqual(typeof proxy, 'function')
    })
    it('should not throw for registering any event', () => {
      assert.doesNotThrow(() => {
        proxy.on(TEST_EVENT_NAME, async () => true)
      })
    })
    it('should accept array as event name', () => {
      assert.doesNotThrow(() => {
        proxy.on([TEST_EVENT_NAME, TEST_EVENT_ALIAS], async () => true)
      })
    })
    it('should throw for registering empty event name', () => {
      assert.throws(() => {
        proxy.on('', async () => true)
      })
    })
    it('should throw if one of array elements is empty', () => {
      assert.throws(() => {
        proxy.on([TEST_EVENT_NAME, TEST_EVENT_ALIAS, ''], async () => true)
      })
    })
    it('should throw for registering undefined event name', () => {
      assert.throws(() => {
        proxy.on(undefined, async () => true)
      })
    })
    it('should throw if one of array elements is undefined', () => {
      assert.throws(() => {
        proxy.on(
          [TEST_EVENT_NAME, TEST_EVENT_ALIAS, undefined],
          async () => true
        )
      })
    })
    it('should throw for registering null event name', () => {
      assert.throws(() => {
        proxy.on(null, async () => true)
      })
    })
    it('should throw if one of array elements is null', () => {
      assert.throws(() => {
        proxy.on([TEST_EVENT_NAME, TEST_EVENT_ALIAS, null], async () => true)
      })
    })
    it('should throw for registering object as event name', () => {
      assert.throws(() => {
        proxy.on({ foo: 'bar' }, async () => true)
      })
    })
    it('should throw if one of array elements is an object', () => {
      assert.throws(() => {
        proxy.on(
          [TEST_EVENT_NAME, TEST_EVENT_ALIAS, { foo: 'bar' }],
          async () => true
        )
      })
    })
    it('should throw for unregistering empty event name', () => {
      assert.throws(() => {
        proxy.off('', async () => true)
      })
    })
    it('should throw for unregistering undefined event name', () => {
      assert.throws(() => {
        proxy.off(undefined, async () => true)
      })
    })
    it('should throw for unregistering null event name', () => {
      assert.throws(() => {
        proxy.off(null, async () => true)
      })
    })
    it('should throw for unregistering object as event name', () => {
      assert.throws(() => {
        proxy.off({ foo: 'bar' }, async () => true)
      })
    })

    it('should throw if handler is not a function', () => {
      assert.throws(() => {
        proxy.on(TEST_EVENT_NAME, { handler: () => true })
      })
    })
    it('should not throw for uninstalling any event', () => {
      assert.doesNotThrow(() => {
        proxy.off(TEST_EVENT_NAME)
      })
    })
    it('should not throw for uninstalling installed event handler', () => {
      proxy.on(TEST_EVENT_NAME, async () => true)
      assert.doesNotThrow(() => {
        proxy.off(TEST_EVENT_NAME)
      })
    })
    it('should not throw for uninstalling removed event handler', () => {
      proxy.on(TEST_EVENT_NAME, async () => true)
      proxy.off(TEST_EVENT_NAME)
      assert.doesNotThrow(() => {
        proxy.off(TEST_EVENT_NAME)
        proxy.off(TEST_EVENT_NAME)
      })
    })
    it('should throw if registering two handlers for same event', () => {
      proxy.on(TEST_EVENT_NAME, async () => true)
      assert.throws(() => {
        proxy.on(TEST_EVENT_NAME, async () => true)
      })
    })
    it('should not throw if double register with the same handler', () => {
      const handler = async () => true
      proxy.on(TEST_EVENT_NAME, handler)
      assert.doesNotThrow(() => {
        proxy.on(TEST_EVENT_NAME, handler)
      })
    })
    it('should not throw when calling alias', () => {
      const handler = async () => true
      proxy.on(TEST_EVENT_NAME, handler)
      assert.doesNotThrow(() => {
        proxy.alias(TEST_EVENT_NAME, TEST_EVENT_ALIAS)
      })
    })
    it('an alias should have the same handler', () => {
      const handler = async () => true
      proxy.on(TEST_EVENT_NAME, handler)
      proxy.alias(TEST_EVENT_NAME, TEST_EVENT_ALIAS)
      assert.doesNotThrow(() => {
        // try to register the same handler
        proxy.on(TEST_EVENT_ALIAS, handler)
      })
      assert.throws(() => {
        // try to register another handler
        proxy.on(TEST_EVENT_ALIAS, async () => true)
      })
    })
    it('should register an array of aliases', () => {
      const handler = async () => true
      proxy.on(TEST_EVENT_NAME, handler)
      assert.doesNotThrow(() => {
        proxy.alias(TEST_EVENT_NAME, [TEST_EVENT_ALIAS, 'another.event'])
      })
    })
    it('should unregister an array of events', () => {
      assert.doesNotThrow(() => {
        proxy.off([TEST_EVENT_NAME, TEST_EVENT_ALIAS])
      })
    })
    it('should throw for aliasing and unregistered event', () => {
      assert.throws(() => {
        proxy.alias(TEST_EVENT_NAME, TEST_EVENT_ALIAS)
      })
    })
    it('should call same handler with an array of registered events', async () => {
      const body1 = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }
      const req1 = new MockReq(body1)
      const res1 = new MockRes()

      const body2 = {
        name: TEST_EVENT_ALIAS,
        payload: { purchaseId: '1234', productId: '3456' },
        timestamp: Date.now()
      }

      const req2 = new MockReq(body2)
      const res2 = new MockRes()

      const handler = proxy()
      proxy.on([TEST_EVENT_NAME, TEST_EVENT_ALIAS], () => ({ foo: 'bar' }))

      await handler(req1, res1)
      await handler(req2, res2)

      assert.deepStrictEqual(res1, res2)
    })
    it('should return 500 if no body', async () => {
      const req = new MockReq({ 'x-etvas-signature': '12345678' }, null)
      const res = new MockRes()
      const handler = proxy()
      try {
        await handler(req, res)
      } catch (e) {}
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 500 if no name in body', async () => {
      const req = new MockReq(
        { 'x-etvas-signature': '12345678' },
        { name: undefined, payload: { foo: 'bar' } }
      )
      const res = new MockRes()
      const handler = proxy()
      try {
        await handler(req, res)
      } catch (e) {}
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 501 if no handlers specified', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }

      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 501)
      assert.strictEqual(res._data.json !== null, true)
      assert.strictEqual(res._data.sent, true)
    })
    it('should return 200 if no signature in headers', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }
      const req = new MockReq({}, body)
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async () => true)
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 400)
      assert.strictEqual(res._data.sent, true)
      assert.strictEqual(res._data.json.error.length > 0, true)
    })
    it('should return 400 if expired timestamp in payload', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now() - 1200000
      }

      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async () => true)
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 400)
      assert.strictEqual(res._data.json !== null, true)
      assert.strictEqual(res._data.sent, true)
    })
    it('should return 400 if invalid timestamp in payload', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: 1
      }

      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async () => true)
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 400)
      assert.strictEqual(res._data.json !== null, true)
      assert.strictEqual(res._data.sent, true)
    })
    it('should return 403 if invalid signature', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }

      const req = new MockReq(
        { 'x-etvas-signature': _sign('a' + JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async () => true)
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 403)
      assert.strictEqual(res._data.json !== null, true)
      assert.strictEqual(res._data.sent, true)
    })
    it('should call handler for event and return 204 if true', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }
      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      let customHandlerCalled = null
      proxy.on(TEST_EVENT_NAME, async received => {
        customHandlerCalled = { ...received }
        return true
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 204)
      assert.strictEqual(res._data.sent, true)
      assert.deepStrictEqual(customHandlerCalled, body.payload)
    })
    it('should return response with 200 if response is object', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }
      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      let customHandlerCalled = null
      proxy.on(TEST_EVENT_NAME, async received => {
        customHandlerCalled = { ...received }
        return { foo: 'bar' }
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 200)
      assert.deepStrictEqual(res._data.json, { foo: 'bar' })
      assert.deepStrictEqual(customHandlerCalled, body.payload)
    })
    it('should return 500 if handler throws error', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }
      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async () => {
        throw new Error('something went wrong')
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 500)
      assert.deepStrictEqual(res._data.json, { error: 'something went wrong' })
    })
    it('should not call handler if uninstalled', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }
      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async () => {
        throw new Error('something went wrong')
      })
      proxy.off(TEST_EVENT_NAME)
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 501)
      assert.strictEqual(res._data.json !== null, true)
    })
    it('should correctly identify an axios error', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: '2345' },
        timestamp: Date.now()
      }
      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async () => {
        const err = {
          message: 'Not Found',
          response: {
            status: 404,
            data: 'error data'
          }
        }
        throw err
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 500)
      assert.strictEqual(res._data.json.error, 'Not Found')
      assert.strictEqual(res._data.json.proxyHttpStatus, 404)
      assert.strictEqual(res._data.json.proxyHttpData, 'error data')
    })
    it('should call event handler with variant if configured', async () => {
      etvas.init({ ..._defaultOptions, ..._additionalOptions })
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: 'key-2345' },
        timestamp: Date.now()
      }
      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      proxy.on(TEST_EVENT_NAME, async (payload, variant) => {
        const { productId } = payload
        assert.strictEqual(productId, 'key-2345')
        assert.strictEqual(variant, 'second')
      })
      const res = new MockRes()
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 200)
    })
    it('should have undefined variant if no product id match', async () => {
      etvas.init({ ..._defaultOptions, ..._additionalOptions })
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: 'key-2346' },
        timestamp: Date.now()
      }
      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async (payload, variant) => {
        assert.strictEqual(payload.productId, 'key-2346')
        assert.strictEqual(variant, undefined)
      })
      const handler = proxy()
      await handler(req, res)
    })
    it('should have undefined variant if not configured', async () => {
      const body = {
        name: TEST_EVENT_NAME,
        payload: { purchaseId: '1234', productId: 'key-1234' },
        timestamp: Date.now()
      }
      const req = new MockReq(
        { 'x-etvas-signature': _sign(JSON.stringify(body)) },
        body
      )
      const res = new MockRes()
      proxy.on(TEST_EVENT_NAME, async (payload, variant) => {
        assert.strictEqual(payload.productId, 'key-1234')
        assert.strictEqual(variant, undefined)
      })
      const handler = proxy()
      await handler(req, res)
    })
  })
})
