const axios = require('axios')
const assert = require('assert').strict

const { describe, it } = require('mocha')
const validate = require('../lib/_validate')

describe('Internal validation', () => {
  it('should throw if unknown key', () => {
    assert.throws(() => {
      validate({ nonExistentTestingKey: true })
    })
  })
  describe('XHR - axios instance', () => {
    it('should fail without an xhr', () => {
      assert.throws(() => {
        validate({ xhr: undefined }, 'TEST')
      })
    })
    it('should fail with null xhr', () => {
      assert.throws(() => {
        validate({ xhr: null }, 'TEST')
      })
    })
    it('should fail with false xhr', () => {
      assert.throws(() => {
        validate({ xhr: false }, 'TEST')
      })
    })
    it('should fail with true xhr', () => {
      assert.throws(() => {
        validate({ xhr: true }, 'TEST')
      })
    })
    it('should pass with a valid axios instance', () => {
      assert.doesNotThrow(() => {
        validate({ xhr: axios.create() })
      })
    })
  })

  describe('KEY - the external storage key', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ key: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ key: '' }, 'TEST')
      })
    })
    it('should fail with object', () => {
      assert.throws(() => {
        validate({ key: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ key: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ key: true }, 'TEST')
      })
    })
    it('should pass with string', () => {
      assert.doesNotThrow(() => {
        validate({ key: 'string' }, 'TEST')
      })
    })
  })
  describe('TOKEN - the JWT auth token', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ token: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ token: '' }, 'TEST')
      })
    })
    it('should fail with object', () => {
      assert.throws(() => {
        validate({ token: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ token: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ token: true }, 'TEST')
      })
    })
    it('should pass with string', () => {
      assert.doesNotThrow(() => {
        validate({ token: 'string' }, 'TEST')
      })
    })
  })
  describe('Options - used in init', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ options: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ options: '' }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ options: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ options: true }, 'TEST')
      })
    })
    it('should pass with object', () => {
      assert.doesNotThrow(() => {
        validate({ options: { foo: 'bar' } }, 'TEST')
      })
    })
  })
  describe('apiURL - used in init options', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ apiURL: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ apiURL: '' }, 'TEST')
      })
    })
    it('should fail with object', () => {
      assert.throws(() => {
        validate({ apiURL: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ apiURL: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ apiURL: true }, 'TEST')
      })
    })
    it('should pass with object', () => {
      assert.doesNotThrow(() => {
        validate({ apiURL: 'https://api.etvas.dev' }, 'TEST')
      })
    })
  })
  describe('apiKey - used in init options', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ apiKey: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ apiKey: '' }, 'TEST')
      })
    })
    it('should fail with object', () => {
      assert.throws(() => {
        validate({ apiKey: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ apiKey: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ apiKey: true }, 'TEST')
      })
    })
    it('should pass with URL', () => {
      assert.doesNotThrow(() => {
        validate({ apiKey: 'https://api.etvas.dev' }, 'TEST')
      })
    })
  })
  describe('productVariants - used in init options', () => {
    it('should not fail with undefined', () => {
      assert.doesNotThrow(() => {
        validate({ productVariants: undefined }, 'TEST')
      })
    })
    it('should not fail with undefined', () => {
      assert.doesNotThrow(() => {
        validate({ productVariants: null }, 'TEST')
      })
    })
    it('should fail with string', () => {
      assert.throws(() => {
        validate({ productVariants: 'foo' }, 'TEST')
      })
    })
    it('should fail with bool', () => {
      assert.throws(() => {
        validate({ productVariants: true }, 'TEST')
      })
    })
    it('should fail with empty object', () => {
      assert.throws(() => {
        validate({ productVariants: {} }, 'TEST')
      })
    })
    it('should not fail with valid object', () => {
      assert.doesNotThrow(() => {
        validate(
          {
            productVariants: {
              '12345678-1234-1234-1234-1234567890ab': 'first',
              '23456789-1234-1234-1234-1234567890ab': 'second'
            }
          },
          'TEST'
        )
      })
    })
  })
  describe('contextId - used in API calls as x-etvas-context-id', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ contextId: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ contextId: '' }, 'TEST')
      })
    })
    it('should fail with object', () => {
      assert.throws(() => {
        validate({ contextId: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ contextId: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ contextId: true }, 'TEST')
      })
    })
    it('should pass with string', () => {
      assert.doesNotThrow(() => {
        validate({ contextId: 'https://api.etvas.dev' }, 'TEST')
      })
    })
  })
  describe('notifyLocale - used in user notifications', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ notifyLocale: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ notifyLocale: '' }, 'TEST')
      })
    })
    it('should fail with object', () => {
      assert.throws(() => {
        validate({ notifyLocale: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ notifyLocale: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ notifyLocale: true }, 'TEST')
      })
    })
    it('should fail with one char string', () => {
      assert.throws(() => {
        validate({ notifyLocale: 'a' }, 'TEST')
      })
    })
    it('should fail with three char string', () => {
      assert.throws(() => {
        validate({ notifyLocale: 'abc' }, 'TEST')
      })
    })
    it('should pass with 2 char string', () => {
      assert.doesNotThrow(() => {
        validate({ notifyLocale: 'en' }, 'TEST')
        validate({ notifyLocale: 'de' }, 'TEST')
        validate({ notifyLocale: 'fr' }, 'TEST')
        validate({ notifyLocale: 'cz' }, 'TEST')
        validate({ notifyLocale: 'ro' }, 'TEST')
      })
    })
  })
  describe('notifySubject - used in user notifications', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ notifySubject: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ notifySubject: '' }, 'TEST')
      })
    })
    it('should fail with object', () => {
      assert.throws(() => {
        validate({ notifySubject: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ notifySubject: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ notifySubject: true }, 'TEST')
      })
    })
    it('should pass with string', () => {
      assert.doesNotThrow(() => {
        validate({ notifySubject: 'subject' }, 'TEST')
      })
    })
  })
  describe('notifyMessage - used in user notifications', () => {
    it('should fail with undefined', () => {
      assert.throws(() => {
        validate({ notifyMessage: undefined }, 'TEST')
      })
    })
    it('should fail with empty', () => {
      assert.throws(() => {
        validate({ notifyMessage: '' }, 'TEST')
      })
    })
    it('should fail with object', () => {
      assert.throws(() => {
        validate({ notifyMessage: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail function', () => {
      assert.throws(() => {
        validate({ notifyMessage: () => true }, 'TEST')
      })
    })
    it('should fail boolean true', () => {
      assert.throws(() => {
        validate({ notifyMessage: true }, 'TEST')
      })
    })
    it('should pass with string', () => {
      assert.doesNotThrow(() => {
        validate({ notifyMessage: 'message' }, 'TEST')
      })
    })
  })
  describe('eventSecret - key used by hmac to verify event signature', () => {
    it('should pass for valid string', () => {
      assert.doesNotThrow(() => {
        validate({ eventSecret: 'a key' }, 'TEST')
      })
    })
    it('should fail for null', () => {
      assert.throws(() => {
        validate({ eventSecret: null }, 'TEST')
      })
    })
    it('should fail for undefined', () => {
      assert.throws(() => {
        validate({ eventSecret: undefined }, 'TEST')
      })
    })
    it('should fail for boolean true', () => {
      assert.throws(() => {
        validate({ eventSecret: true }, 'TEST')
      })
    })
    it('should fail for boolean false', () => {
      assert.throws(() => {
        validate({ eventSecret: false }, 'TEST')
      })
    })
    it('should fail for object', () => {
      assert.throws(() => {
        validate({ eventSecret: { foo: 'bar' } }, 'TEST')
      })
    })
  })
})
