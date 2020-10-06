const assert = require('assert').strict
const axios = require('axios')
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')

const REQUEST_URL = '/user/profile'

const getProfile = require('../../lib/client/getProfile')

describe('Client.getProfile', () => {
  let xhr
  beforeEach(() => {
    xhr = axios.create({
      headers: {
        'x-api-key': '1234',
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    moxios.install(xhr)
  })
  afterEach(() => {
    moxios.uninstall(xhr)
  })
  it('should exist', () => {
    assert.strictEqual(typeof getProfile, 'function')
  })
  it('should fail if no context', done => {
    getProfile(xhr)
      .then(result => {
        assert.fail()
      })
      .catch(() => {
        done()
      })
  })
  it('should call /user/profile', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.url, REQUEST_URL)
      assert.strictEqual(request.config.headers['x-api-key'], '1234')
      assert.strictEqual(
        request.config.headers['x-etvas-context'],
        'my context'
      )
      assert.strictEqual(request.config.method, 'get')
      request.respondWith({ status: 200 })
      done()
    })
    getProfile(xhr, 'my context')
  })

  it('should append contextId to data', async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200, response: { foo: 'bar' } })
    })
    const response = await getProfile(xhr, 'my context')
    assert.strictEqual(response.contextId, 'my context')
  })
  it('should append query string if provided', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.url, `${REQUEST_URL}?include=address`)
      request.respondWith({ status: 200 })
      done()
    })
    getProfile(xhr, 'my context', { include: 'address' })
  })
})
