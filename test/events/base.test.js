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

const EVENT_PRODUCT_PURCHASED = 'product.purchased'

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
        proxy.off(EVENT_PRODUCT_PURCHASED)
      } catch (e) { }
    })
    it('should be a function', () => {
      assert.strictEqual(typeof proxy, 'function')
    })
    it(`should add handler for ${EVENT_PRODUCT_PURCHASED}`, () => {
      assert.doesNotThrow(() => {
        proxy.on(EVENT_PRODUCT_PURCHASED, async () => true)
      })
    })
    it('should throw if handler already installed', () => {
      proxy.on(EVENT_PRODUCT_PURCHASED, async () => true)
      assert.throws(() => {
        proxy.on(EVENT_PRODUCT_PURCHASED, async () => true)
      })
    })
    it('should throw for installing unknown event handler', () => {
      assert.throws(() => {
        proxy.on('non-existent-test-event', async () => true)
      })
    })
    it('should throw for uninstalling unknown event handler', () => {
      assert.throws(() => {
        proxy.off('non-existent-test-event')
      })
    })
    it('should throw for uninstalling non-existent event handler', () => {
      assert.throws(() => {
        proxy.off(EVENT_PRODUCT_PURCHASED)
      })
    })
    it('should not throw for uninstalling installed event handler', () => {
      proxy.on(EVENT_PRODUCT_PURCHASED, async () => true)
      assert.doesNotThrow(() => {
        proxy.off(EVENT_PRODUCT_PURCHASED)
      })
    })
    it('should throw for uninstalling removed event handler', () => {
      proxy.on(EVENT_PRODUCT_PURCHASED, async () => true)
      proxy.off(EVENT_PRODUCT_PURCHASED)
      assert.throws(() => {
        proxy.off(EVENT_PRODUCT_PURCHASED)
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
      const req = new MockReq({}, { name: undefined, payload: { foo: 'bar' } })
      const res = new MockRes()
      const handler = proxy()
      try {
        await handler(req, res)
      } catch (e) { }
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 500 if no x-api-key in header', async () => {
      const req = new MockReq({}, { name: EVENT_PRODUCT_PURCHASED, payload: { foo: 'bar' } })
      const res = new MockRes()
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 500 for invalid event name', async () => {
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: 'invalid-test-event-name', payload: { foo: 'bar' } })
      const res = new MockRes()
      const handler = proxy()
      try {
        await handler(req, res)
      } catch (e) { }
      assert.strictEqual(res._data.status, 500)
    })
    it('should return 501 if no handlers specified', async () => {
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: EVENT_PRODUCT_PURCHASED, payload: { purchaseId: '1234', productId: '2345' } })
      const res = new MockRes()
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 501)
      assert.strictEqual(res._data.sent, true)
    })

    it(`should call handler for ${EVENT_PRODUCT_PURCHASED} and return 204 if true`, async () => {
      const expected = { purchaseId: '1234', productId: '2345' }
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: EVENT_PRODUCT_PURCHASED, payload: expected })
      const res = new MockRes()
      let customHandlerCalled = null
      proxy.on(EVENT_PRODUCT_PURCHASED, async payload => {
        customHandlerCalled = { ...payload }
        return true
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 204)
      assert.strictEqual(res._data.sent, true)
      assert.deepStrictEqual(customHandlerCalled, expected)
      proxy.off(EVENT_PRODUCT_PURCHASED)
    })
    it(`should call handler for ${EVENT_PRODUCT_PURCHASED} and return 500 if false`, async () => {
      const expected = { purchaseId: '1234', productId: '2345' }
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: EVENT_PRODUCT_PURCHASED, payload: expected })
      const res = new MockRes()
      let customHandlerCalled = null
      proxy.on(EVENT_PRODUCT_PURCHASED, async payload => {
        customHandlerCalled = { ...payload }
        return false
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 500)
      assert.strictEqual(res._data.sent, true)
      assert.deepStrictEqual(customHandlerCalled, expected)
    })
    it('should return response with 200 if not boolean', async () => {
      const expected = { purchaseId: '1234', productId: '2345' }
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: EVENT_PRODUCT_PURCHASED, payload: expected })
      const res = new MockRes()
      let customHandlerCalled = null
      proxy.on(EVENT_PRODUCT_PURCHASED, async payload => {
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
      const req = new MockReq({ 'x-api-key': '12345678' }, { name: EVENT_PRODUCT_PURCHASED, payload: expected })
      const res = new MockRes()
      proxy.on(EVENT_PRODUCT_PURCHASED, async payload => {
        throw new Error('something went wrong')
      })
      const handler = proxy()
      await handler(req, res)
      assert.strictEqual(res._data.status, 500)
    })
  })
})
