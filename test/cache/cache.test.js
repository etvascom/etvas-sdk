const assert = require('assert').strict
const { describe, it, beforeEach, after } = require('mocha')

const cache = require('../../lib/utils/cache')

const _wait = timeout =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, timeout)
  })

describe('Cache -- Async', () => {
  beforeEach(() => {
    cache.clear({ all: true })
  })
  after(() => {
    cache.clear({ all: true })
  })
  it('should exist', () => {
    assert.equal(!!cache, true)
  })
  it('should have method has', () => {
    assert.equal(typeof cache.has, 'function')
  })
  it('should have method read', () => {
    assert.equal(typeof cache.read, 'function')
  })
  it('should have method write', () => {
    assert.equal(typeof cache.write, 'function')
  })
  it('should have method clear', () => {
    assert.equal(typeof cache.clear, 'function')
  })

  it('should async write a value', async () => {
    assert.doesNotThrow(async () => {
      await cache.write('key', 'value')
    })
  })
  it('should read a value with an async generator function', async () => {
    const _generate = async () => {
      await _wait(10)
      return 'async-generated-value'
    }
    const retrieved = await cache.read('async key', _generate)
    assert.equal(retrieved, 'async-generated-value')
  })
  it('should not call generator function if value already cached', async () => {
    let generatorCalled = 0
    const key = 'another-key'
    const _generate = async () => {
      await _wait(3)
      generatorCalled = generatorCalled + 1
      return `async-generated-value-${generatorCalled}`
    }
    const retrieved = await cache.read(key, _generate)
    assert.equal(retrieved, 'async-generated-value-1')
    assert.equal(generatorCalled, 1)
    for (let i = 0; i < 5; i++) {
      const cached = await cache.read(key, _generate)
      assert.equal(cached, 'async-generated-value-1')
      assert.equal(generatorCalled, 1)
    }
  })
  it('should call generator function if value expired', async () => {
    let generatorCalled = 0
    const key = 'another-key'
    const _generate = async () => {
      await _wait(3)
      generatorCalled = generatorCalled + 1
      return `async-generated-value-${generatorCalled}`
    }
    const retrieved = await cache.read(key, _generate, {
      expiresInterval: 10
    })
    assert.equal(retrieved, 'async-generated-value-1')
    assert.equal(generatorCalled, 1)
    await _wait(50)
    const retrieved2 = await cache.read(key, _generate)
    assert.equal(retrieved2, 'async-generated-value-2')
    const retrieved3 = await cache.read(key, _generate)
    assert.equal(retrieved3, 'async-generated-value-2')
  })
})
