const { describe, it, afterEach } = require('mocha')
const assert = require('assert').strict
const etvas = require('../../lib/etvas')
const config = require('../../lib/init/config')
const cache = require('../../lib/utils/cache')

const proxy = require('../../lib/events/proxy')

const TEST_EVENT_NAME = 'event.test.name'

const _sdkDebugMode = value => {
  if (value || value === undefined) {
    process.env.ETVAS_SDK_DEBUG = true
    return
  }
  delete process.env.ETVAS_SDK_DEBUG
}

const _defaultOptions = {
  apiURL: 'https://localhost:1234',
  apiKey: '12345678',
  eventSecret: '12345678'
}

const _withDebugSuppress = {
  debug: {
    suppressSignatureCheck: true
  }
}

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

function MockReq(headers, body) {
  this.headers = headers
  this.body = body

  this.get = header => this.headers[header]
}

describe('Events with suppress signature check', () => {
  afterEach(() => {
    cache.clear({ all: true })
    config.clear()
    proxy.off(TEST_EVENT_NAME)
  })
  it('should take into account process env variable', () => {
    _sdkDebugMode()
    assert.strictEqual(!!process.env.ETVAS_SDK_DEBUG, true)
  })
  it('should be able to unset the env variable', () => {
    _sdkDebugMode(false)
    assert.strictEqual(process.env.ETVAS_SDK_DEBUG, undefined)
  })
  it('should return 204 if process variable and debug config are set', async () => {
    etvas.init({ ..._defaultOptions, ..._withDebugSuppress })
    _sdkDebugMode()

    const body = {
      name: TEST_EVENT_NAME,
      payload: { purchaseId: '1234', productId: '2345' }
    }
    const req = new MockReq({}, body)
    const res = new MockRes()
    proxy.on(TEST_EVENT_NAME, async () => true)
    const handler = proxy()
    await handler(req, res)
    assert.strictEqual(res._data.status, 204)
    assert.strictEqual(res._data.sent, true)
  })
  it('should return 400 if process variable not set', async () => {
    _sdkDebugMode(false)
    etvas.init({ ..._defaultOptions, ..._withDebugSuppress })

    const body = {
      name: TEST_EVENT_NAME,
      payload: { purchaseId: '1234', productId: '2345' }
    }
    const req = new MockReq({}, body)
    const res = new MockRes()
    proxy.on(TEST_EVENT_NAME, async () => true)
    const handler = proxy()
    await handler(req, res)
    assert.strictEqual(res._data.status, 400)
    assert.strictEqual(res._data.sent, true)
  })
  it('should return 400 if process variable set but no debug config', async () => {
    _sdkDebugMode(true)
    etvas.init({ ..._defaultOptions })

    const body = {
      name: TEST_EVENT_NAME,
      payload: { purchaseId: '1234', productId: '2345' }
    }
    const req = new MockReq({}, body)
    const res = new MockRes()
    proxy.on(TEST_EVENT_NAME, async () => true)
    const handler = proxy()
    await handler(req, res)
    assert.strictEqual(res._data.status, 400)
    assert.strictEqual(res._data.sent, true)
  })
})
