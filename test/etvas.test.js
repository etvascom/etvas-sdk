const assert = require('assert').strict
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')
const etvas = require('../lib/etvas')
const config = require('../lib/init/config')
const cache = require('../lib/utils/cache')

const REQUEST_URL = '/external-data'

const _defaultOptions = {
  apiURL: 'https://localhost:1234',
  apiKey: '12345678'
}

const _wait = timeout =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, timeout)
  })

describe('Etvas SDK', () => {
  it('should exist', () => {
    assert.equal(typeof etvas, 'object')
  })
  it('should have an init method', () => {
    assert.equal(typeof etvas.init, 'function')
  })
  describe('Init', () => {
    it('should not throw if correct options are set', () => {
      assert.doesNotThrow(() => {
        etvas.init({ ..._defaultOptions })
      })
    })
    it('should preserve config once init is called', async () => {
      etvas.init({ ..._defaultOptions })
      await _wait(10)
      assert.equal(config.get('apiURL'), _defaultOptions.apiURL)
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
      assert.equal(typeof etvas.client, 'function')
    })
    it('should have a read function', () => {
      assert.equal(typeof etvas.client.read, 'function')
    })
    it('should have a write function', () => {
      assert.equal(typeof etvas.client.write, 'function')
    })
    it('should have a read function in context', () => {
      assert.equal(typeof etvas.client('token').read, 'function')
    })
    it('should have a write function in context', () => {
      assert.equal(typeof etvas.client('token').write, 'function')
    })
    describe('no-context', () => {
      it('read should call correct url', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.equal(request.config.url, `${REQUEST_URL}/a-key`)
          assert.equal(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.equal(request.config.method, 'get')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.read('a-key')
      })
      it('write should call correct url', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.equal(request.config.url, `${REQUEST_URL}/two-keys`)
          assert.equal(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.equal(request.config.method, 'put')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.write('two-keys', 'a-value')
      })
      it('write should delete with null value', done => {
        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.equal(request.config.url, `${REQUEST_URL}/two-keys`)
          assert.equal(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.equal(request.config.method, 'delete')
          request.respondWith({ status: 200 })
          done()
        })
        etvas.client.write('two-keys', null)
      })
    })
    describe('with-context', () => {
      beforeEach(() => {
        cache.clear({ all: true })
      })
      it('read should call verify token first', async () => {
        moxios.stubRequest(`${REQUEST_URL}/context-id-1234`, {
          status: 200
        })

        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.equal(request.config.url, '/verify-token')
          assert.equal(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.equal(request.config.method, 'post')
          request.respondWith({
            status: 200,
            response: { contextId: 'context-id-1234' }
          })
        })

        await etvas.client('token').read('a-key')
      })
      it('write should call verify token first', async () => {
        moxios.stubRequest(`${REQUEST_URL}/context-id-12345`, {
          status: 200
        })

        moxios.wait(() => {
          const request = moxios.requests.mostRecent()
          assert.equal(request.config.url, '/verify-token')
          assert.equal(
            request.config.headers['x-api-key'],
            _defaultOptions.apiKey
          )
          assert.equal(request.config.method, 'post')
          request.respondWith({
            status: 200,
            response: { contextId: 'context-id-12345' }
          })
        })

        await etvas.client('token').write('a-write-key', 'a-value')
      })
    })
  })
})