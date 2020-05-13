const assert = require('assert').strict
const { describe, it } = require('mocha')

const config = require('../lib/init/config')

describe('Config', () => {
  it('should exist', () => {
    assert.equal(typeof config, 'object')
  })
  it('should store an option with a value', () => {
    assert.doesNotThrow(() => {
      config.set('a key', 'a value')
    })
  })
  it('should be able to retrieve a stored value', () => {
    config.set('a key', 'a value')
    const retrieved = config.get('a key')
    assert.equal(retrieved, 'a value')
  })
  it('should be able to set more options at once', () => {
    config.set({ foo: 'first', bar: 'second' })
    const foo = config.get('foo')
    assert.equal(foo, 'first')
    const bar = config.get('bar')
    assert.equal(bar, 'second')
  })
})
