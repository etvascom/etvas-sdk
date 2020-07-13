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
  describe('Raw Email To recipients', () => {
    it('should pass for an array of emails', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailTo: ['foo@bar.com', 'example@test.com'] }, 'TEST')
      })
    })
    it('should pass for an array of objects', () => {
      assert.doesNotThrow(() => {
        const to = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: 'appleseed@example.com' }
        ]
        validate({ rawEmailTo: to }, 'TEST')
      })
    })
    it('should fail for empty email in array', () => {
      assert.throws(() => {
        validate({ rawEmailTo: ['foo@bar.com', ''] }, 'TEST')
      })
    })
    it('should fail for an array of objects with invalid email', () => {
      assert.throws(() => {
        const to = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: '@example.com' }
        ]
        validate({ rawEmailTo: to }, 'TEST')
      })
    })
    it('should fail for an array of objects with empty email', () => {
      assert.throws(() => {
        const to = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: '' }
        ]
        validate({ rawEmailTo: to }, 'TEST')
      })
    })
    it('should fail for null value', () => {
      assert.throws(() => {
        validate({ rawEmailTo: null }, 'TEST')
      })
    })
    it('should fail for undefined value', () => {
      assert.throws(() => {
        validate({ rawEmailTo: undefined }, 'TEST')
      })
    })
    it('should fail for boolean true', () => {
      assert.throws(() => {
        validate({ rawEmailTo: true }, 'TEST')
      })
    })
    it('should fail for empty array', () => {
      assert.throws(() => {
        validate({ rawEmailTo: [] }, 'TEST')
      })
    })
  })
  describe('Raw Email CC recipients', () => {
    it('should pass for an array of emails', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailCc: ['foo@bar.com', 'example@test.com'] }, 'TEST')
      })
    })
    it('should pass for an array of objects', () => {
      assert.doesNotThrow(() => {
        const to = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: 'appleseed@example.com' }
        ]
        validate({ rawEmailCc: to }, 'TEST')
      })
    })
    it('should fail for invalid email in array', () => {
      assert.throws(() => {
        validate({ rawEmailCc: ['foo@bar.com', '@test.com'] }, 'TEST')
      })
    })
    it('should fail for empty email in array', () => {
      assert.throws(() => {
        validate({ rawEmailCc: ['foo@bar.com', ''] }, 'TEST')
      })
    })
    it('should fail for an array of objects with invalid email', () => {
      assert.throws(() => {
        const cc = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: '@example.com' }
        ]
        validate({ rawEmailCc: cc }, 'TEST')
      })
    })
    it('should fail for an array of objects with empty email', () => {
      assert.throws(() => {
        const cc = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: '' }
        ]
        validate({ rawEmailCc: cc }, 'TEST')
      })
    })
    it('should pass for null value', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailCc: null }, 'TEST')
      })
    })
    it('should pass for undefined value', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailCc: undefined }, 'TEST')
      })
    })
    it('should fail for boolean true', () => {
      assert.throws(() => {
        validate({ rawEmailCc: true }, 'TEST')
      })
    })
    it('should pass for empty array', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailCc: [] }, 'TEST')
      })
    })
  })
  describe('Raw Email BCC recipients', () => {
    it('should pass for an array of emails', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailBcc: ['foo@bar.com', 'example@test.com'] }, 'TEST')
      })
    })
    it('should pass for an array of objects', () => {
      assert.doesNotThrow(() => {
        const to = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: 'appleseed@example.com' }
        ]
        validate({ rawEmailBcc: to }, 'TEST')
      })
    })
    it('should fail for invalid email', () => {
      assert.throws(() => {
        validate({ rawEmailBcc: ['foo@bar.com', '@test.com'] }, 'TEST')
      })
    })
    it('should fail for empty email', () => {
      assert.throws(() => {
        validate({ rawEmailBcc: ['foo@bar.com', ''] }, 'TEST')
      })
    })
    it('should fail for an array of objects with invalid email', () => {
      assert.throws(() => {
        const bcc = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: '@example.com' }
        ]
        validate({ rawEmailBcc: bcc }, 'TEST')
      })
    })
    it('should fail for an array of objects with empty email', () => {
      assert.throws(() => {
        const bcc = [
          { name: 'Jon', email: 'jon@example.com' },
          { name: 'Appleseed', email: '' }
        ]
        validate({ rawEmailBcc: bcc }, 'TEST')
      })
    })
    it('should pass for null value', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailBcc: null }, 'TEST')
      })
    })
    it('should pass for undefined value', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailBcc: undefined }, 'TEST')
      })
    })
    it('should fail for boolean true', () => {
      assert.throws(() => {
        validate({ rawEmailBcc: true }, 'TEST')
      })
    })
    it('should pass for empty array', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailBcc: [] }, 'TEST')
      })
    })
  })
  describe('Raw Email Subject', () => {
    it('should pass for a non-empty string', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailSubject: 'Hello' }, 'TEST')
      })
    })
    it('should fail for empty string', () => {
      assert.throws(() => {
        validate({ rawEmailSubject: '' }, 'TEST')
      })
    })
    it('should fail for an array', () => {
      assert.throws(() => {
        validate({ rawEmailSubject: ['foo'] }, 'TEST')
      })
    })
    it('should fail for an object', () => {
      assert.throws(() => {
        validate({ rawEmailSubject: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail for boolean true', () => {
      assert.throws(() => {
        validate({ rawEmailSubject: true }, 'TEST')
      })
    })
  })
  describe('Raw Email Text', () => {
    it('should pass for a non-empty string', () => {
      assert.doesNotThrow(() => {
        validate({ rawEmailText: 'Hello' }, 'TEST')
      })
    })
    it('should fail for empty string', () => {
      assert.throws(() => {
        validate({ rawEmailText: '' }, 'TEST')
      })
    })
    it('should fail for an array', () => {
      assert.throws(() => {
        validate({ rawEmailText: ['foo'] }, 'TEST')
      })
    })
    it('should fail for an object', () => {
      assert.throws(() => {
        validate({ rawEmailText: { foo: 'bar' } }, 'TEST')
      })
    })
    it('should fail for boolean true', () => {
      assert.throws(() => {
        validate({ rawEmailText: true }, 'TEST')
      })
    })
  })
})
