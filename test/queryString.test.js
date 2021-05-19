const { describe, it } = require('mocha')
const assert = require('assert').strict

const { getQueryString } = require('../lib/utils/queryString')

describe('QueryString builder utility function', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof getQueryString, 'function')
  })

  const invalidParams = {
    'null parameter': null,
    'undefined value': undefined,
    'empty object': {},
    'a string': '',
    'a function': () => ({ foo: 'bar' }),
    'boolean true': true,
    'boolean false': false
  }

  Object.keys(invalidParams).forEach(name => {
    it(`should return empty string for ${name}`, () => {
      assert.strictEqual(getQueryString(invalidParams[name]), '')
    })
  })

  it('should return a valid query string', () => {
    const params = { foo: 'bar', live: 'yes', valid: 1, api: 'yes' }
    const expected = '?foo=bar&live=yes&valid=1&api=yes'
    assert.strictEqual(getQueryString(params), expected)
  })

  it('should correctly escape a value', () => {
    const params = { foo: 'bar baz bah' }
    const expected = '?foo=bar%20baz%20bah'
    assert.strictEqual(getQueryString(params), expected)
  })

  it('should correctly escape a var name', () => {
    const params = { 'foo bar': 'bar baz bah' }
    const expected = '?foo%20bar=bar%20baz%20bah'
    assert.strictEqual(getQueryString(params), expected)
  })
})
