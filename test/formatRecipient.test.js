const { describe, it } = require('mocha')
const assert = require('assert').strict

const formatRecipient = require('../lib/client/stubs/formatRecipient')
const validateEmail = require('../lib/client/stubs/validateEmail')

describe('Format Recipient utility', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof formatRecipient, 'function')
  })
  it('should accept a string', () => {
    const expected = 'test@example.com'
    const actual = formatRecipient(expected)
    assert.strictEqual(actual, expected)
  })
  it('should accept an object with email only attribute', () => {
    const expected = { email: 'test@example.com' }
    const actual = formatRecipient(expected)
    assert.strictEqual(actual, expected.email)
  })
  it('should format name and email', () => {
    const input = { name: 'Jon Appleseed', email: 'test@example.com' }
    const expected = 'Jon Appleseed <test@example.com>'
    const actual = formatRecipient(input)
    assert.strictEqual(actual, expected)
  })
})

describe('Validate email utility', () => {
  it('should be a function', () => {
    assert.strictEqual(typeof validateEmail, 'function')
  })
  const validEmails = [
    'test@example.com',
    'a@a.io',
    'foo+1234_5678@bar.de',
    'no-reply@etvas-dev.xyz',
    'no-reply@example.museum',
    'something.example-1234@mail.example.io'
  ]
  const invalidEmails = [
    'test@example',
    'test@.com',
    '@test.com',
    'foo bar@example.com'
  ]

  validEmails.forEach(validEmail => {
    it(`should identify ${validEmail} as valid`, () => {
      const actual = validateEmail(validEmail)
      assert.strictEqual(actual, true)
    })
  })

  invalidEmails.forEach(invalidEmail => {
    it(`should identify ${invalidEmail} as invalid`, () => {
      const actual = validateEmail(invalidEmail)
      assert.strictEqual(actual, false)
    })
  })
})
