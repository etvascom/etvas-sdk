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
    assert.equal(typeof getProfile, 'function')
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
  it('should call /user/profile', async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.equal(request.config.url, REQUEST_URL)
      assert.equal(request.config.headers['x-api-key'], '1234')
      assert.equal(request.config.headers['x-etvas-context'], 'my context')
      assert.equal(request.config.method, 'get')
      request.respondWith({ status: 200 })
    })
    await getProfile(xhr, 'my context')
  })
})
