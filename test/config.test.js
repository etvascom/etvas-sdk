const assert = require('assert').strict
const { describe, it, beforeEach } = require('mocha')

const config = require('../lib/init/config')

describe('Config', () => {
  beforeEach(() => {
    config.clear()
  })
  it('should exist', () => {
    assert.strictEqual(typeof config, 'object')
  })
  it('should store an option with a value', () => {
    assert.doesNotThrow(() => {
      config.set('a key', 'a value')
    })
  })
  it('should be able to retrieve a stored value', () => {
    config.set('a key', 'a value')
    const retrieved = config.get('a key')
    assert.strictEqual(retrieved, 'a value')
  })
  it('should be able to set more options at once', () => {
    config.set({ foo: 'first', bar: 'second' })
    const foo = config.get('foo')
    assert.strictEqual(foo, 'first')
    const bar = config.get('bar')
    assert.strictEqual(bar, 'second')
  })
  it('should have an all() method', () => {
    assert.strictEqual(typeof config.all, 'function')
  })
  it('all should get the entire config', () => {
    const actual = { first: 'first', second: 'second' }
    config.set(actual)
    assert.deepEqual(config.all(), actual)
  })
})
