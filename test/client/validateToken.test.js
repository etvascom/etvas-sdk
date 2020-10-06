const assert = require('assert').strict
const axios = require('axios')
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')

const REQUEST_URL = '/verify-token'

const validateToken = require('../../lib/client/validateToken')

describe('Client.validateToken', () => {
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
    assert.strictEqual(typeof validateToken, 'function')
  })
  it(`should make a post call to ${REQUEST_URL}`, async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.url, REQUEST_URL)
      assert.strictEqual(request.config.headers['x-api-key'], '1234')
      assert.strictEqual(request.config.method, 'post')
      request.respondWith({ status: 200 })
    })
    await validateToken(xhr, 'token')
  })
  it('should fail if no token', async () => {
    try {
      await validateToken(xhr)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if token is undefined', async () => {
    try {
      await validateToken(xhr)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if token is null', async () => {
    try {
      await validateToken(xhr, null)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if token is true', async () => {
    try {
      await validateToken(xhr, true)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if token is false', async () => {
    try {
      await validateToken(xhr, false)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if token is number', async () => {
    try {
      await validateToken(xhr, 1234)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
})
