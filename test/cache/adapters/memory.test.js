const assert = require('assert').strict
const { describe, it, beforeEach, after } = require('mocha')

const adapter = require('../../../lib/utils/cache/adapters/memory')

const _wait = timeout =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, timeout)
  })

describe('MemoryCacheAdapter', () => {
  beforeEach(() => {
    adapter.clear({ all: true })
  })
  after(() => {
    adapter.clear({ all: true })
  })
  it('should exist', () => {
    assert.equal(!!adapter, true)
  })
  it('should have method has', () => {
    assert.equal(typeof adapter.has, 'function')
  })
  it('should have method read', () => {
    assert.equal(typeof adapter.read, 'function')
  })
  it('should have method write', () => {
    assert.equal(typeof adapter.write, 'function')
  })
  it('should have method clear', () => {
    assert.equal(typeof adapter.clear, 'function')
  })
  it('should return null for a value not stored', () => {
    const value = adapter.read('non-existent-key')
    assert.equal(value, null)
  })
  it('should return specified default value for a value not stored', () => {
    const value = adapter.read('non-existent-key', 'default-value')
    assert.equal(value, 'default-value')
  })
  it('should successfully store a key', () => {
    assert.doesNotThrow(() => {
      adapter.write('key', '1234')
    })
  })
  it('should not accept a null key', () => {
    assert.throws(() => {
      adapter.write(null, '1234')
    })
  })
  it('should retrieve a previously stored value', () => {
    const storedValue = `value-${Math.floor(10000 * Math.random())}`
    adapter.write('key', storedValue)
    const retrieved = adapter.read('key')
    assert.equal(retrieved, storedValue)
  })
  it('should clear a previously stored value', () => {
    const storedValue = `value-${Math.floor(10000 * Math.random())}`
    adapter.write('key', storedValue)
    const retrieved = adapter.read('key')
    assert.equal(retrieved, storedValue)
    adapter.clear('key')
    const actual = adapter.read('key')
    assert.equal(actual, null)
  })
  it('should throw an error if no key specified calling clear', () => {
    assert.throws(() => {
      adapter.clear()
    })
  })
  it('should not throw an error if force clear', () => {
    assert.doesNotThrow(() => {
      adapter.clear({ all: true })
    })
  })
  it('should be able to store an object', () => {
    const storedValue = {
      foo: 'bar',
      fun: () => {
        return 'a function'
      }
    }
    adapter.write('complex-key', storedValue)
    const retrieved = adapter.read('complex-key')
    assert.equal(retrieved.foo, storedValue.foo)
    assert.equal(retrieved.fun(), storedValue.fun())
  })
  it('should update value on each call', () => {
    const key = 'overwrite-key'
    adapter.write(key, 'first-value')
    assert.equal(adapter.read(key), 'first-value')
    adapter.write(key, 'second-value')
    assert.equal(adapter.read(key), 'second-value')
  })

  it('should expire after specified time', async () => {
    const _now = new Date().valueOf()
    adapter.write('foo', 'bar', _now + 50)
    const immediate = adapter.read('foo')
    assert.equal(immediate, 'bar')
    await _wait(51)
    const retrieved = adapter.read('foo')
    assert.equal(retrieved, null)
  })
})
