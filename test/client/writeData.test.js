const assert = require('assert').strict
const axios = require('axios')
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')

const REQUEST_URL = '/external-data'

const writeData = require('../../lib/client/writeData')

describe('Client.writeData', () => {
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
    assert.equal(typeof writeData, 'function')
  })
  it(`should make a call to ${REQUEST_URL}/key`, done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.equal(request.config.url, `${REQUEST_URL}/a-key`)
      assert.equal(request.config.headers['x-api-key'], '1234')
      assert.equal(request.config.method, 'put')
      request.respondWith({ status: 200 })
      done()
    })
    writeData(xhr, 'a-key', 'a-value')
  })
  it('should write a string value', async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      request.respondWith({ status: 200 })
    })
    const response = await writeData(xhr, 'a-key', 'a-value')
    assert.equal(response, true)
  })
  it('should fail if key is not a string', async () => {
    try {
      await writeData(xhr, { foo: 'bar' }, 'a-value')
    } catch (err) {
      assert.equal(err instanceof Error, true)
    }
  })
  it('should fail if key is undefined', async () => {
    try {
      await writeData(xhr, undefined, 'a-value')
    } catch (err) {
      assert.equal(err instanceof Error, true)
    }
  })
  it('should fail if key is null', async () => {
    try {
      await writeData(xhr, null, 'a-value')
    } catch (err) {
      assert.equal(err instanceof Error, true)
    }
  })
  it('should fail if key is true', async () => {
    try {
      await writeData(xhr, true, 'a-value')
    } catch (err) {
      assert.equal(err instanceof Error, true)
    }
  })
  it('should fail if key is false', async () => {
    try {
      await writeData(xhr, false, 'a-value')
    } catch (err) {
      assert.equal(err instanceof Error, true)
    }
  })
  it('should fail if key is number', async () => {
    try {
      await writeData(xhr, 1234, 'a-value')
    } catch (err) {
      assert.equal(err instanceof Error, true)
    }
  })
  it('should delete the data if value is null', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.equal(request.config.url, `${REQUEST_URL}/a-key`)
      assert.equal(request.config.headers['x-api-key'], '1234')
      assert.equal(request.config.method, 'delete')
      request.respondWith({ status: 200 })
      done()
    })
    writeData(xhr, 'a-key', null)
  })
})
