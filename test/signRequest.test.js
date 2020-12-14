const assert = require('assert').strict
const { describe, it } = require('mocha')

const {
  computeHash,
  prepareSignature
} = require('../lib/client/stubs/signRequest')

describe('SignRequest', () => {
  describe('computeHash', () => {
    it('should compute hash for empty payload', () => {
      const hash = computeHash()
      assert.equal(
        hash,
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      )
    })
    it('should compute hash for empty string payload', () => {
      const hash = computeHash('')
      assert.equal(
        hash,
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      )
    })
    it('should compute hash for string', () => {
      const hash = computeHash('{"foo":"bar"}')
      assert.equal(
        hash,
        '7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b'
      )
    })
    it('should compute hash for json object representation', () => {
      const hash = computeHash(JSON.stringify({ foo: 'bar' }))
      assert.equal(
        hash,
        '7a38bf81f383f69433ad6e900d35b3e2385593f76a7b7ab5d4355b8ba41ee24b'
      )
    })
    it('should compute hash for complex json object representation', () => {
      const obj = {
        name: 'Alex',
        surname: 'Sofronie',
        emailAddress: ['alex.sofronie@etvas.com', 'alsofronie@gmail.com'],
        company: 'Etvas',
        objectives: {
          primary: 'Make Etvas Great',
          secondary: [
            'Have Value Added Services more important in life',
            'Have a healthier life'
          ]
        }
      }
      const hash = computeHash(JSON.stringify(obj))
      assert.equal(
        hash,
        '5670655c9d45689b18fa60b93eb03baa51ae5e4819afdcf70b62317ce6366b1d'
      )
    })
    it('should fail for an object', () => {
      assert.throws(() => {
        computeHash({ foo: 'bar' })
      })
    })
  })
  describe('ComputeSignature', () => {
    it('should compute GET signature with context', () => {
      const forcedTimestamp = 1607936087
      const signature = prepareSignature(
        {
          method: 'GET',
          url: 'https://api.etvas.com?foo=bar',
          headers: {
            'x-etvas-context': '1234',
            'Content-Type': 'application/json'
          }
        },
        {
          apiKey: '12345678-1234-1234',
          reqSignatureSecret: 'ABCD1234'
        },
        forcedTimestamp
      )
      assert.strictEqual(
        signature.signature,
        '8f1390035963c3d88e68e8fd6a470a5391b7ce309b1dff9560cb7b22712ef941'
      )
      assert.strictEqual(signature.timestamp, forcedTimestamp)
      assert.strictEqual(signature.canonical, undefined)
    })
    it('should compute GET signature without context', () => {
      const forcedTimestamp = 1607936087
      const signature = prepareSignature(
        {
          method: 'GET',
          url: 'https://api.etvas.com?bar=stub',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        {
          apiKey: '12345678-1234-1234',
          reqSignatureSecret: 'ABCD1234'
        },
        forcedTimestamp
      )
      assert.strictEqual(
        signature.signature,
        'e257053154603e6b9482cb9220afb41621363198e0b2d0b5c0d97540f546790d'
      )
      assert.strictEqual(signature.timestamp, forcedTimestamp)
      assert.strictEqual(signature.canonical, undefined)
    })
    it('should compute POST signature with context', () => {
      const forcedTimestamp = 1607936087
      const signature = prepareSignature(
        {
          method: 'POST',
          url: 'https://api.etvas.com/verify-token',
          headers: {
            'Content-Type': 'application/json',
            'x-etvas-context': '1234'
          },
          data: { foo: 'bar' }
        },
        {
          apiKey: '12345678-1234-1234',
          reqSignatureSecret: 'ABCD1234'
        },
        forcedTimestamp
      )
      assert.strictEqual(
        signature.signature,
        '52cf53821b21042e097d1dcf87866b744334ce48aff7d64a8c76efe3faa44212'
      )
      assert.strictEqual(signature.timestamp, forcedTimestamp)
      assert.strictEqual(signature.canonical, '{"foo":"bar"}')
    })
    it('should compute POST signature without context', () => {
      const forcedTimestamp = 1607936087
      const signature = prepareSignature(
        {
          method: 'POST',
          url: 'https://api.etvas.com/?bar=stub',
          headers: {
            'Content-Type': 'application/json'
          },
          data: { foo: 'bar' }
        },
        {
          apiKey: '12345678-1234-1234',
          reqSignatureSecret: 'ABCD1234'
        },
        forcedTimestamp
      )
      assert.strictEqual(
        signature.signature,
        '3945dd37ac7d1a896a98b139dbe608ab2b24ec35c9aea7fba8e9a90ef0b8409b'
      )
      assert.strictEqual(signature.timestamp, forcedTimestamp)
      assert.strictEqual(signature.canonical, '{"foo":"bar"}')
    })
  })
})
