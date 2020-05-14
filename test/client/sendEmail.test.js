const assert = require('assert').strict
const axios = require('axios')
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')

const REQUEST_URL = '/user/notify'

const sendEmail = require('../../lib/client/sendEmail')

describe('Client.sendEmail', () => {
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
    assert.equal(typeof sendEmail, 'function')
  })
  it(`should make a call to ${REQUEST_URL}`, async () => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.equal(request.config.url, REQUEST_URL)
      assert.equal(request.config.headers['x-api-key'], '1234')
      assert.equal(request.config.headers['x-etvas-context'], 'context-3456')
      assert.equal(request.config.method, 'post')
      request.respondWith({ status: 200 })
    })
    await sendEmail(xhr, 'context-3456', {
      locale: 'en',
      subject: 'subject',
      message: 'message'
    })
  })
})
