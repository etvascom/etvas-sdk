const assert = require('assert').strict
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')
const etvas = require('../lib/etvas')
const config = require('../lib/init/config')
const cache = require('../lib/utils/cache')

const REQUEST_URL = '/external-data'

const _defaultOptions = {
  apiURL: 'https://localhost:1234',
  apiKey: '12345678',
  eventSecret: '12345678',
  debug: {
    suppressSignatureCheck: true
  }
}

const _additionalOptions = {
  productVariants: {
    'key-1234': 'first',
    'key-2345': 'second'
  }
}

const _wait = timeout =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, timeout)
  })

describe('Etvas SDK', () => {
  beforeEach(() => {
    config.clear()
  })
  afterEach(() => {
    config.clear()
  })
  it('should exist', () => {
    assert.strictEqual(typeof etvas, 'object')
  })
  it('should have an init method', () => {
    assert.strictEqual(typeof etvas.init, 'function')
  })
  describe('Init', () => {
    it('should not throw if correct options are set', () => {
      assert.doesNotThrow(() => {
        etvas.init({ ..._defaultOptions })
      })
    })
    it('should not throw if options and additional options are set', () => {
      assert.doesNotThrow(() => {
        etvas.init({ ..._defaultOptions, ..._additionalOptions })
      })
    })
    it('should preserve config once init is called', async () => {
      etvas.init({ ..._defaultOptions })
      await _wait(10)
      assert.strictEqual(config.get('apiURL'), _defaultOptions.apiURL)
    })
    it('should preserve additional options once init is called', async () => {
      etvas.init({ ..._defaultOptions, ..._additionalOptions })
      await _wait(10)
      assert.strictEqual(config.get('apiURL'), _defaultOptions.apiURL)
      assert.deepStrictEqual(
        config.get('productVariants'),
        _additionalOptions.productVariants
      )
    })
    it('should throw if no apiKey', () => {
      assert.throws(() => {
        etvas.init({
          apiURL: _defaultOptions.apiURL
        })
      })
    })
    it('should throw if apiKey less than 4 characters', () => {
      assert.throws(() => {
        etvas.init({
          apiURL: _defaultOptions.apiURL,
          apiKey: '123'
        })
      })
    })
    it('should throw if no apiURL', () => {
      assert.throws(() => {
        etvas.init({
          apiKey: '1234-1234-12'
        })
      })
    })
    it('should throw if null apiURL', () => {
      assert.throws(() => {
        etvas.init({
          apiURL: null,
          apiKey: '1234-1234-12'
        })
      })
    })
  })
  describe('Client', () => {
    let xhr
    beforeEach(() => {
      etvas.init({ ..._defaultOptions })
      moxios.install(config.get('xhr'))
    })
    afterEach(() => {
      moxios.uninstall(xhr)
      config.clear()
    })
    it('should exist as a function', () => {
      assert.strictEqual(typeof etvas.client, 'function')
    })
    describe('Without a context', () => {
      it('should have a read function', () => {
        assert.strictEqual(typeof etvas.client.read, 'function')
      })
      it('should have a write function', () => {
        assert.strictEqual(typeof etvas.client.write, 'function')
      })
      it('should have a clear function', () => {
        assert.strictEqual(typeof etvas.client.clear, 'function')
      })
      it('should have a getCustomerProfile function', () => {
        assert.strictEqual(typeof etvas.client.getCustomerProfile, 'function')
      })
      it('should have a getPurchaseDetails function', () => {
        assert.strictEqual(typeof etvas.client.getPurchaseDetails, 'function')
      })
      it('read should call correct url', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, `${REQUEST_URL}/a-key`)
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'get')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.read('a-key')
      })
      it('write should call correct url', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, `${REQUEST_URL}/two-keys`)
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'put')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.write('two-keys', 'a-value')
      })
      it('write should delete with null value', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, `${REQUEST_URL}/two-keys`)
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'delete')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.write('two-keys', null)
      })
      it('clear should delete with null value', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, `${REQUEST_URL}/clear-key`)
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'delete')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.clear('clear-key')
      })
      it('should call correct URL for customer profile', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/user/profile')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'get')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.getCustomerProfile('1234')
      })
      it('should call correct URL for purchase details', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/purchase')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'get')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.getPurchaseDetails('1234')
      })
      it('should call correct URL sending email', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/user/notify')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'post')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.sendEmailNotification('1234', {
          locale: 'de',
          subject: 'Testing German',
          message: 'This is a test'
        })
      })
    })
    describe('With a context', () => {
      it('should have a read function in context', () => {
        assert.strictEqual(typeof etvas.client('token').read, 'function')
      })
      it('should have a write function in context', () => {
        assert.strictEqual(typeof etvas.client('token').write, 'function')
      })
      it('should have a clear function in context', () => {
        assert.strictEqual(typeof etvas.client('token').clear, 'function')
      })
      it('should have a getCustomerProfile function in context', () => {
        assert.strictEqual(
          typeof etvas.client('token').getCustomerProfile,
          'function'
        )
      })
      it('should have a getPurchaseDetails function in context', () => {
        assert.strictEqual(
          typeof etvas.client('token').getPurchaseDetails,
          'function'
        )
      })
      it('should have a getProductVariant function in context', () => {
        assert.strictEqual(
          typeof etvas.client('token').getProductVariant,
          'function'
        )
      })
      it('should call correct URL for customer profile', done => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: {
            contextId: '1234'
          }
        })
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/user/profile')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'get')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client('token').getCustomerProfile()
      })
      it('should call the getProfile internal function', async () => {
        const expected = { firstName: 'Test', email: 'test@example.com' }
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: {
            contextId: '1234'
          }
        })
        moxios.stubRequest('/user/profile', {
          status: 200,
          response: {
            ...expected
          }
        })
        const profile = await etvas.client('token').getCustomerProfile()
        assert.deepStrictEqual(profile, { contextId: '1234', ...expected })
      })
      it('should call correct URL for purchase details', done => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: {
            contextId: '1234'
          }
        })

        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/purchase')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'get')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client('token').getPurchaseDetails()
      })
      it('should call correct URL sending email', done => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: {
            contextId: '1234'
          }
        })
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/user/notify')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'post')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client('1234').sendEmailNotification({
          locale: 'en',
          subject: 'Text',
          message: 'This is a test'
        })
      })
    })
    it('should throw on getProductVariants if no configuration given', async () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()
        request.respondWith({
          status: 200,
          response: { contextId: '1234', productId: 'key-1234' }
        })
      })
      try {
        await etvas.client('token').getProductVariant('key-1234')
      } catch (err) {
        assert.strictEqual(err instanceof Error, true)
      }
    })
    it('should identify product variant if configuration given', async () => {
      moxios.stubRequest('/verify-token', {
        status: 200,
        response: { contextId: '1234', productId: 'key-1234' }
      })
      etvas.init({
        ..._defaultOptions,
        ..._additionalOptions
      })
      const result = await etvas.client('token').getProductVariant('key-1234')
      assert.strictEqual(result, 'first')
    })
    describe('With context, no cache', () => {
      beforeEach(() => {
        cache.clear({ all: true })
      })
      it('should fail with no context specified', () => {
        try {
          etvas.client(null)
        } catch (err) {
          assert.strictEqual(err instanceof TypeError, false)
          assert.strictEqual(err.message.indexOf('validateToken') > 0, true)
        }
      })
      it('read should call verify token first', async () => {
        moxios.stubRequest(`${REQUEST_URL}/context-id-1234`, {
          status: 200
        })

        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/verify-token')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'post')
          request.respondWith({
            status: 200,
            response: { contextId: 'context-id-1234' }
          })
        })
        await etvas.client('token').read('a-key')
      })
      it('read should fail if no context', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { noContext: true }
        })
        try {
          await etvas.client('token').read('two-key')
        } catch (err) {
          assert.strictEqual(err instanceof Error, true)
        }
      })
      it('write should call verify token first', done => {
        moxios.stubRequest(`${REQUEST_URL}/context-id-12345`, {
          status: 200
        })

        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/verify-token')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'post')
          request.respondWith({
            status: 200,
            response: { contextId: 'context-id-12345' }
          })
          done()
        })
        etvas.client('token').write('a-write-key', 'a-value')
      })
      it('clear should call verify token first', done => {
        moxios.stubRequest(`${REQUEST_URL}/context-id-12345`, {
          status: 200
        })

        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.strictEqual(request.config.url, '/verify-token')
          assert.strictEqual(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.strictEqual(request.config.method, 'post')
          request.respondWith({
            status: 200,
            response: { contextId: 'context-id-12345' }
          })
          done()
        })
        etvas.client('token').clear('a-write-key')
      })
      it('write should fail if no context', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { noContext: true }
        })
        try {
          await etvas.client('token').write('key-id', 'value')
        } catch (err) {
          assert.strictEqual(err instanceof Error, true)
        }
      })
      it('clear should fail if no context', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { noContext: true }
        })
        try {
          await etvas.client('token').clear('key-id')
        } catch (err) {
          assert.strictEqual(err instanceof Error, true)
        }
      })
      it('customerProfile should fail if no context', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { noContext: true }
        })
        try {
          await etvas.client('token').getCustomerProfile()
        } catch (err) {
          assert.strictEqual(err instanceof Error, true)
        }
      })
      it('customerProfile should not use cached value if different token', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { contextId: 'context-1234' }
        })
        moxios.stubRequest('/user/profile', {
          status: 200,
          response: { data: { foo: 'bar' } }
        })
        await etvas.client('token1').getCustomerProfile()
        await etvas.client('token2').getCustomerProfile()
        await etvas.client('token3').getCustomerProfile()

        const verifyTokenRequests = moxios.requests.__items
          .filter(request => request.config.url === '/verify-token')
          .map(request => JSON.parse(request.config.data))

        assert.deepStrictEqual(verifyTokenRequests, [
          { token: 'token1' },
          { token: 'token2' },
          { token: 'token3' }
        ])
      })
      it('purchaseDetails should fail if no context', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { noContext: true }
        })
        try {
          await etvas.client('token').getPurchaseDetails()
        } catch (err) {
          assert.strictEqual(err instanceof Error, true)
        }
      })
      it('purchaseDetails should not use cached value if different token', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { contextId: 'context-1234' }
        })
        moxios.stubRequest('/purchase', {
          status: 200,
          response: { data: { foo: 'bar' } }
        })
        await etvas.client('token1').getPurchaseDetails()
        await etvas.client('token2').getPurchaseDetails()
        await etvas.client('token3').getPurchaseDetails()

        const verifyTokenRequests = moxios.requests.__items
          .filter(request => request.config.url === '/verify-token')
          .map(request => JSON.parse(request.config.data))

        assert.deepStrictEqual(verifyTokenRequests, [
          { token: 'token1' },
          { token: 'token2' },
          { token: 'token3' }
        ])
      })
      it('read should not use cached value if different token', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { contextId: 'context-1234' }
        })
        moxios.stubRequest('/external-data/context-1234', {
          status: 200,
          response: { data: '{"foo":"bar"}' }
        })
        await etvas.client('token1').read()
        await etvas.client('token2').read()
        await etvas.client('token3').read()

        const verifyTokenRequests = moxios.requests.__items
          .filter(request => request.config.url === '/verify-token')
          .map(request => JSON.parse(request.config.data))

        assert.deepStrictEqual(verifyTokenRequests, [
          { token: 'token1' },
          { token: 'token2' },
          { token: 'token3' }
        ])
      })
      it('write should not use cached value if different token', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { contextId: 'context-1234' }
        })
        moxios.stubRequest('/external-data/context-1234', {
          status: 200
        })
        await etvas.client('token1').write('one value')
        await etvas.client('token2').write('two values')
        await etvas.client('token3').write('three values')

        const verifyTokenRequests = moxios.requests.__items
          .filter(request => request.config.url === '/verify-token')
          .map(request => JSON.parse(request.config.data))

        assert.deepStrictEqual(verifyTokenRequests, [
          { token: 'token1' },
          { token: 'token2' },
          { token: 'token3' }
        ])
      })
      it('clear should not use cached value if different token', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { contextId: 'context-1234' }
        })
        moxios.stubRequest('/external-data/context-1234', {
          status: 200
        })
        await etvas.client('token1').clear()
        await etvas.client('token2').clear()
        await etvas.client('token3').clear()

        const verifyTokenRequests = moxios.requests.__items
          .filter(request => request.config.url === '/verify-token')
          .map(request => JSON.parse(request.config.data))

        assert.deepStrictEqual(verifyTokenRequests, [
          { token: 'token1' },
          { token: 'token2' },
          { token: 'token3' }
        ])
      })
      it('sendEmail should not use cached value if different token', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { contextId: 'context-1234' }
        })
        moxios.stubRequest('/user/notify', {
          status: 200
        })

        const mail = {
          locale: 'en',
          subject: 'test subject',
          message: 'test message'
        }

        await etvas.client('token1').sendEmailNotification(mail)
        await etvas.client('token2').sendEmailNotification(mail)
        await etvas.client('token3').sendEmailNotification(mail)

        const verifyTokenRequests = moxios.requests.__items
          .filter(request => request.config.url === '/verify-token')
          .map(request => JSON.parse(request.config.data))

        assert.deepStrictEqual(verifyTokenRequests, [
          { token: 'token1' },
          { token: 'token2' },
          { token: 'token3' }
        ])
      })
      it('customerProfile should use cached value if same token', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { contextId: 'context-1234' }
        })
        moxios.stubRequest('/user/profile', {
          status: 200,
          response: { data: { foo: 'bar' } }
        })
        await etvas.client('token1').getCustomerProfile()
        await etvas.client('token1').getCustomerProfile()
        await etvas.client('token1').getCustomerProfile()

        const verifyTokenRequests = moxios.requests.__items
          .filter(request => request.config.url === '/verify-token')
          .map(request => JSON.parse(request.config.data))

        assert.deepStrictEqual(verifyTokenRequests, [{ token: 'token1' }])
      })
      it('sendEmailNotification should fail if no context', async () => {
        moxios.stubRequest('/verify-token', {
          status: 200,
          response: { noContext: true }
        })
        try {
          await etvas.client('token').sendEmailNotification({
            locale: 'en',
            subject: 'test subject',
            message: 'test message'
          })
        } catch (err) {
          assert.strictEqual(err instanceof Error, true)
        }
      })
    })
  })
  describe('Etvas HMAC', () => {
    it('should exist', () => {
      assert.strictEqual(etvas.hmac !== undefined, true)
    })
    it('should be an object', () => {
      assert.strictEqual(typeof etvas.hmac, 'object')
    })
    it('should have a verify function', () => {
      assert.strictEqual(typeof etvas.hmac.verify, 'function')
    })
    it('verify should use the eventSecret from init', () => {
      etvas.init({ ..._defaultOptions })
      const canonical = 'I hereby accept'
      const signature =
        '315dd557354e2a99ba2050d52165fb0a3085cc77535085d398a255613a8b480b'
      assert.strictEqual(etvas.hmac.verify(canonical, signature), true)
    })
    it('verify should fail without an init', () => {
      assert.throws(() => {
        const canonical = 'I hereby accept'
        const signature =
          '315dd557354e2a99ba2050d52165fb0a3085cc77535085d398a255613a8b480b'
        etvas.hmac.verify(canonical, signature)
      })
    })
  })
  describe('Etvas Internal Mail', () => {
    it('should be a function', () => {
      assert.strictEqual(typeof etvas.client._sendRawEmail, 'function')
    })
  })
})
