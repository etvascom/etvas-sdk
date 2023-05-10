const assert = require('assert').strict
const axios = require('axios')
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')

const sendEmail = require('../../lib/client/sendEmail')

const REQUEST_URL = '/user/notify'

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
    assert.strictEqual(typeof sendEmail, 'function')
  })
  it(`should make a call to ${REQUEST_URL}`, done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.url, REQUEST_URL)
      assert.strictEqual(request.config.headers['x-api-key'], '1234')
      assert.strictEqual(
        request.config.headers['x-etvas-context'],
        'context-3456'
      )
      assert.strictEqual(request.config.method, 'post')
      const body = JSON.parse(request.config.data)
      assert.notEqual(body, null)
      assert.strictEqual(body.locale, 'en')
      assert.strictEqual(body.subject, 'subject')
      assert.strictEqual(body.message, 'message')
      request.respondWith({ status: 200 })
      done()
    })
    sendEmail(xhr, 'context-3456', {
      locale: 'en',
      subject: 'subject',
      message: 'message'
    })
  })
})
