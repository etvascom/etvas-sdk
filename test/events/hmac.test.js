const assert = require('assert').strict
const { describe, it } = require('mocha')

const hmac = require('../../lib/utils/hmac')

const invalidValues = {
  'an undefined value': undefined,
  'a null value': null,
  'an object': { foo: 'bar' },
  'an array': ['a', 'b'],
  'a boolean true': true,
  'a boolean false': false,
  'a number': 3.1415926,
  'an error': new Error('Canonical')
}

describe('HMAC', () => {
  it('should exist', () => {
    assert.strictEqual(hmac !== undefined, true)
  })
  it('should be an object', () => {
    assert.strictEqual(typeof hmac === 'object', true)
  })
  it('should expose a sign function', () => {
    assert.strictEqual(typeof hmac.sign, 'function')
  })
  it('should expose a verify function', () => {
    assert.strictEqual(typeof hmac.verify, 'function')
  })
  describe('HMAC Sign', () => {
    Object.keys(invalidValues).forEach(failFor => {
      const invalidValue = invalidValues[failFor]
      it(`should fail for ${failFor} canonical value`, () => {
        assert.throws(() => {
          hmac.sign(invalidValue, '12345678')
        })
      })
      it(`should fail for ${failFor} key value`, () => {
        assert.throws(() => {
          hmac.sign('valid string', invalidValue)
        })
      })
    })

    it('should not fail for empty string canonical', () => {
      assert.doesNotThrow(() => {
        hmac.sign('', '12345678')
      })
    })
    it('should pass for a non-empty string', () => {
      assert.doesNotThrow(() => {
        hmac.sign('hello, etvas', '12345678')
      })
    })
    it('should sign a string with sha256 and return hex digest by default', () => {
      const canonical = 'I hereby agree'
      const key = 'my secret signature'
      const actual = hmac.sign(canonical, key)
      const expected =
        'f11d7a44718128386a25a5c578ba5e66a3b04515276d3e4fda5ab5c422a5a40b'
      assert.strictEqual(actual, expected)
    })
    it('should sign a string with sha256 and return binary buffer for no digest option', () => {
      const canonical = 'I hereby agree'
      const key = 'my secret signature'
      const actual = hmac.sign(canonical, key, { algorithm: 'sha256' })
      const expected = Buffer.from(
        'f11d7a44718128386a25a5c578ba5e66a3b04515276d3e4fda5ab5c422a5a40b',
        'hex'
      )
      assert.deepStrictEqual(actual, expected)
    })
  })
  describe('HMAC Verify', () => {
    it('should verify a string signature by default', () => {
      const canonical = 'I hereby agree'
      const key = 'my secret signature'
      const signature =
        'f11d7a44718128386a25a5c578ba5e66a3b04515276d3e4fda5ab5c422a5a40b'
      assert.strictEqual(hmac.verify(canonical, signature, key), true)
    })
    it('should verify a binary signature', () => {
      const canonical = 'I hereby agree'
      const key = 'my secret signature'
      const signature = Buffer.from(
        'f11d7a44718128386a25a5c578ba5e66a3b04515276d3e4fda5ab5c422a5a40b',
        'hex'
      )
      assert.strictEqual(
        hmac.verify(canonical, signature, key, { algorithm: 'sha256' }),
        true
      )
    })
    it('should fail an invalid string signature by default', () => {
      const canonical = 'I hereby agree'
      const key = 'my secret signature'
      const signature =
        'e11d7a44718128386a25a5c578ba5e66a3b04515276d3e4fda5ab5c422a5a40b'
      assert.strictEqual(hmac.verify(canonical, signature, key), false)
    })
    it('should fail for different canonical', () => {
      const canonical = 'I hereby disagree'
      const key = 'my secret signature'
      const signature =
        'e11d7a44718128386a25a5c578ba5e66a3b04515276d3e4fda5ab5c422a5a40b'
      assert.strictEqual(hmac.verify(canonical, signature, key), false)
    })
    it('should fail for different key', () => {
      const canonical = 'I hereby agree'
      const key = 'mine secret signature'
      const signature =
        'e11d7a44718128386a25a5c578ba5e66a3b04515276d3e4fda5ab5c422a5a40b'
      assert.strictEqual(hmac.verify(canonical, signature, key), false)
    })
    it('should fail an invalid a binary signature', () => {
      const canonical = 'I hereby agree'
      const key = 'my secret signature'
      const signature = Buffer.from(
        'e11d7a44718128386a25a5c578ba5e66a3b04515276d3e4fda5ab5c422a5a40b',
        'hex'
      )
      assert.strictEqual(
        hmac.verify(canonical, signature, key, { algorithm: 'sha256' }),
        false
      )
    })
    Object.keys(invalidValues).forEach(failFor => {
      const invalidValue = invalidValues[failFor]
      it(`should fail for ${failFor} canonical value`, () => {
        assert.throws(() => {
          hmac.verify(invalidValue, 'key', '12345678')
        })
      })
      it(`should fail for ${failFor} key value`, () => {
        assert.throws(() => {
          hmac.sign('valid string', invalidValue, '12345678')
        })
      })
    })
  })
})
