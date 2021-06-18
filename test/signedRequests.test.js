const assert = require('assert').strict
const moxios = require('moxios')
const crypto = require('crypto')
const { describe, it, beforeEach, afterEach } = require('mocha')

const xhrFactory = require('../lib/client/xhr')

describe('Signed requests', () => {
  let xhr
  beforeEach(() => {
    xhr = xhrFactory({
      apiKey: '1234',
      reqSignatureSecret: 'a-secret'
    })
    moxios.install(xhr)
  })
  afterEach(() => {
    moxios.uninstall(xhr)
  })
  it('should append valid timestamp in header', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(!!request.config.headers['x-timestamp'], true)
      const headerTimestamp = request.config.headers['x-timestamp']
      assert.strictEqual(isNaN(headerTimestamp), false)
      const now = Math.floor(Date.now() / 1000)
      assert.strictEqual(now - parseInt(headerTimestamp) < 1000, true)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.get('/greet')
  })
  it('should append a signature header', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(!!request.config.headers['x-signature'], true)
      const headerSignature = request.config.headers['x-signature']
      assert.strictEqual(typeof headerSignature, 'string')
      request.respondWith({ status: 200 })
      done()
    })
    xhr.get('/greet')
  })

  it('should correctly compute signature for a get request', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto.createHash('sha256').update('').digest('hex')
      const ts = parseInt(request.config.headers['x-timestamp'])
      // by default we add the application/json content-type to everything
      const payload = `GET\n/greet\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.get('/greet')
  })
  it('should omit content-type if not specified', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto.createHash('sha256').update('').digest('hex')
      const ts = parseInt(request.config.headers['x-timestamp'])
      // by default we add the application/json content-type to everything
      const payload = `GET\n/greet\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.get('/greet', { headers: { 'Content-Type': '' } })
  })
  it('should correctly compute signature for a post request', done => {
    const data = { foo: 'bar' }
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex')
      // we hope we are in the same second...
      const ts = parseInt(request.config.headers['x-timestamp'])
      const payload = `POST\n/greet\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.post('/greet', data)
  })
  it('should correctly compute signature for a put request', done => {
    const data = { foo: 'bar' }
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex')
      // we hope we are in the same second...
      const ts = parseInt(request.config.headers['x-timestamp'])
      const payload = `PUT\n/greet\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.put('/greet', data)
  })
  it('should correctly compute signature for a patch request', done => {
    const data = { foo: 'bar' }
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex')
      // we hope we are in the same second...
      const ts = parseInt(request.config.headers['x-timestamp'])
      const payload = `PATCH\n/greet\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.patch('/greet', data, {
      headers: { 'Content-Type': 'application/json' }
    })
  })
  it('should correctly compute signature for a delete request', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto.createHash('sha256').update('').digest('hex')
      const ts = parseInt(request.config.headers['x-timestamp'])
      // by default we add the application/json content-type to everything
      const payload = `DELETE\n/greet\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.delete('/greet')
  })
  it('should automatically add x-etvas-context if present', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto.createHash('sha256').update('').digest('hex')
      const ts = parseInt(request.config.headers['x-timestamp'])
      // by default we add the application/json content-type to everything
      const payload = `GET\n/greet\ncontent-type:application/json\nx-api-key:1234\nx-etvas-context:2345\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.get('/greet', { headers: { 'x-etvas-context': '2345' } })
  })
  it('should take into account params', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto.createHash('sha256').update('').digest('hex')
      const ts = parseInt(request.config.headers['x-timestamp'])
      // by default we add the application/json content-type to everything
      const payload = `GET\n/greet\nfoo=bar\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.get('/greet', { params: { foo: 'bar' } })
  })
  it('should parse params from url', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto.createHash('sha256').update('').digest('hex')
      const ts = parseInt(request.config.headers['x-timestamp'])
      // by default we add the application/json content-type to everything
      const payload = `GET\n/greet\nfoo=bar\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.get('/greet?foo=bar')
  })
  it('should default to GET if no method specified', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto.createHash('sha256').update('').digest('hex')
      const ts = parseInt(request.config.headers['x-timestamp'])
      // by default we add the application/json content-type to everything
      const payload = `GET\n\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.request({ method: '' })
  })
  it('should not double-encode a payload', done => {
    const data = JSON.stringify({ foo: 'bar' })
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const hash = crypto.createHash('sha256').update(data).digest('hex')
      // we hope we are in the same second...
      const ts = parseInt(request.config.headers['x-timestamp'])
      const payload = `POST\n/greet\ncontent-type:application/json\nx-api-key:1234\nx-timestamp:${ts}\n${hash}`
      const expected = crypto
        .createHmac('sha256', 'a-secret')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.post('/greet', data)
  })
})

describe('Empty body on post', () => {
  let xhr
  beforeEach(() => {
    xhr = xhrFactory({
      apiKey: 'api-key-1234',
      reqSignatureSecret: '1234',
      forcedTimestamp: 1624018703
    })
    moxios.install(xhr)
  })
  afterEach(() => {
    moxios.uninstall(xhr)
  })
  it('should correctly compute signature for an empty post request', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const payload = `POST
/users/user@example.com/authorize
content-type:application/json
x-api-key:api-key-1234
x-timestamp:1624018703
44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`
      const expected = crypto
        .createHmac('sha256', '1234')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.post('/users/user@example.com/authorize', {})
  })

  it('should correctly compute signature for an undefined body post request', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      const payload = `POST
/users/user@example.com/authorize
content-type:application/json
x-api-key:api-key-1234
x-timestamp:1624018703
44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a`
      const expected = crypto
        .createHmac('sha256', '1234')
        .update(payload)
        .digest('hex')
      const actual = request.config.headers['x-signature']
      assert.strictEqual(actual, expected)
      request.respondWith({ status: 200 })
      done()
    })
    xhr.post('/users/user@example.com/authorize')
  })
})
