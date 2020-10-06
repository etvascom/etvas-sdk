const assert = require('assert').strict
const axios = require('axios')
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')

const REQUEST_URL = '/external-data'

const readData = require('../../lib/client/readData')

describe('Client.readData', () => {
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
    assert.strictEqual(typeof readData, 'function')
  })
  it(`should make a call to ${REQUEST_URL}/key`, async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.url, `${REQUEST_URL}/a-key`)
      assert.strictEqual(request.config.headers['x-api-key'], '1234')
      assert.strictEqual(request.config.method, 'get')
      request.respondWith({ status: 200 })
    })
    await readData(xhr, 'a-key')
  })
  it('should fail if key is not a string', async () => {
    try {
      await readData(xhr, { foo: 'bar' })
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if key is undefined', async () => {
    try {
      await readData(xhr)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if key is null', async () => {
    try {
      await readData(xhr, null)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if key is true', async () => {
    try {
      await readData(xhr, true)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if key is false', async () => {
    try {
      await readData(xhr, false)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should fail if key is number', async () => {
    try {
      await readData(xhr, 1234)
    } catch (err) {
      assert.strictEqual(err instanceof Error, true)
    }
  })
  it('should return string if string is stored', async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.method, 'get')
      assert.strictEqual(request.config.url, '/external-data/a-key')
      request.respondWith({
        status: 200,
        response: { data: 'a non-json string' }
      })
    })
    const response = await readData(xhr, 'a-key')
    assert.strictEqual(response, 'a non-json string')
  })

  it('should return object if JSON is stored', async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.method, 'get')
      assert.strictEqual(request.config.url, '/external-data/a-key')
      request.respondWith({
        status: 200,
        response: { data: JSON.stringify({ foo: 'bar' }) }
      })
    })
    const response = await readData(xhr, 'a-key')
    assert.deepEqual(response, { foo: 'bar' })
  })
})
