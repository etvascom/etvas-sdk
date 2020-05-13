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
})
