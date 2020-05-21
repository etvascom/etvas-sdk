const assert = require('assert').strict
const { describe, it, beforeEach, afterEach } = require('mocha')

const etvas = require('../../lib/etvas')
const config = require('../../lib/init/config')
const cache = require('../../lib/utils/cache')

const proxy = require('../../lib/events/proxy')

const _defaultOptions = {
  apiURL: 'https://localhost:1234',
  apiKey: '12345678'
}

const TEST_EVENT_NAME = 'event.test.name'

class MockRes {
  constructor () {
    this._data = { status: null, json: null, sent: false }
  }

  status (value) {
    this._data.status = value
    return this
  }

  json (value) {
    this._data.json = value
    this._data.sent = true
    return this
  }

  send () {
    this._data.sent = true
    return this
  }
}

function MockReq (headers, body) {
  this.headers = headers
  this.body = body

  this.get = header => this.headers[header]
}

describe('Events', () => {
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
  describe('Event proxy', () => {
    beforeEach(() => {
      try {
        proxy.off(TEST_EVENT_NAME)
      } catch (e) { }
    })
    it('should be a function', () => {
      assert.strictEqual(typeof proxy, 'function')
    })
    it('should not throw for registering any event', () => {
      assert.doesNotThrow(() => {
        proxy.on(TEST_EVENT_NAME, async () => true)
      })
    })
    it('should throw for registering empty event name', () => {
      assert.throws(() => {
        proxy.on('', async () => true)
      })
    })
    it('should throw for registering undefined event name', () => {
      assert.throws(() => {
        proxy.on(undefined, async () => true)
      })
    })
    it('should throw for registering null event name', () => {
      assert.throws(() => {
        proxy.on(null, async () => true)
      })
    })
    it('should throw for registering object as event name', () => {
      assert.throws(() => {
        proxy.on({ foo: 'bar' }, async () => true)
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
    it('should return 500 if no body', async () => {
      const req = new MockReq({}, null)
      const res = new MockRes()
      const handler = proxy()
      try {
        await handler(req, res)
      } catch (e) { }
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 500 if no name in body', async () => {
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: undefined, payload: { foo: 'bar' } })
      const res = new MockRes()
      const handler = proxy()
      try {
        await handler(req, res)
      } catch (e) { }
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 500 if no x-api-key in header', async () => {
      const req = new MockReq({}, { name: TEST_EVENT_NAME, payload: { foo: 'bar' } })
      const res = new MockRes()
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 500 if x-api-key invalid', async () => {
      const req = new MockReq({ 'x-api-key': '1234567' }, { name: TEST_EVENT_NAME, payload: { foo: 'bar' } })
      const res = new MockRes()
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 501 if no handlers specified', async () => {
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: TEST_EVENT_NAME, payload: { purchaseId: '1234', productId: '2345' } })
      const res = new MockRes()
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 501)
      assert.strictEqual(res._data.json !== null, true)
      assert.strictEqual(res._data.sent, true)
    })
    it('should call handler for event and return 204 if true', async () => {
      const expected = { purchaseId: '1234', productId: '2345' }
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: TEST_EVENT_NAME, payload: expected })
      const res = new MockRes()
      let customHandlerCalled = null
      proxy.on(TEST_EVENT_NAME, async payload => {
        customHandlerCalled = { ...payload }
        return true
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 204)
      assert.strictEqual(res._data.sent, true)
      assert.deepStrictEqual(customHandlerCalled, expected)
    })
    it('should return response with 200 if response', async () => {
      const expected = { purchaseId: '1234', productId: '2345' }
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: TEST_EVENT_NAME, payload: expected })
      const res = new MockRes()
      let customHandlerCalled = null
      proxy.on(TEST_EVENT_NAME, async payload => {
        customHandlerCalled = { ...payload }
        return { foo: 'bar' }
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 200)
      assert.deepStrictEqual(res._data.json, { foo: 'bar' })
      assert.deepStrictEqual(customHandlerCalled, expected)
    })
    it('should return 500 if handler throws error', async () => {
      const expected = { purchaseId: '1234', productId: '2345' }
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: TEST_EVENT_NAME, payload: expected })
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
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: TEST_EVENT_NAME, payload: { productId: '1234', purchaseId: '2345' } })
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
  })
})
