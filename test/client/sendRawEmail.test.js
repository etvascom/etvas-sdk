const assert = require('assert').strict
const axios = require('axios')
const moxios = require('moxios')

const { describe, it, beforeEach, afterEach } = require('mocha')

const sendRawEmail = require('../../lib/client/_sendRawEmail')

const REQUEST_URL = '/email/send'

describe('Client._sendRawEmail', () => {
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
    assert.strictEqual(typeof sendRawEmail, 'function')
  })
  it(`should make a call to ${REQUEST_URL}`, done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.url, REQUEST_URL)
      assert.strictEqual(request.config.headers['x-api-key'], '1234')
      assert.strictEqual(request.config.method, 'post')
      const body = JSON.parse(request.config.data)
      assert.notEqual(body, null)
      assert.deepStrictEqual(body.to, ['test@example.com'])
      assert.strictEqual(body.subject, 'subject')
      assert.strictEqual(body.text, 'message')
      request.respondWith({ status: 200 })
      done()
    })
    sendRawEmail(xhr, {
      to: [{ email: 'test@example.com' }],
      subject: 'subject',
      text: 'message'
    })
  })
  it('should accept CC and BCC', done => {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent()
      assert.strictEqual(request.config.url, REQUEST_URL)
      assert.strictEqual(request.config.headers['x-api-key'], '1234')
      assert.strictEqual(request.config.method, 'post')
      const body = JSON.parse(request.config.data)
      assert.notEqual(body, null)
      assert.deepStrictEqual(body.to, ['test@example.com'])
      assert.deepStrictEqual(body.cc, ['test1@example.com'])
      assert.deepStrictEqual(body.bcc, ['test2@example.com'])
      assert.strictEqual(body.subject, 'subject')
      assert.strictEqual(body.text, 'message')
      request.respondWith({ status: 200 })
      done()
    })
    sendRawEmail(xhr, {
      to: [{ email: 'test@example.com' }],
      cc: [{ email: 'test1@example.com' }],
      bcc: [{ email: 'test2@example.com' }],
      subject: 'subject',
      text: 'message'
    })
  })
})
