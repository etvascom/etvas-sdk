const assert = require('assert').strict
const { describe, it, beforeEach, after } = require('mocha')

const cache = require('../../lib/utils/cache')

const _wait = timeout =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, timeout)
  })

describe('Cache', () => {
  describe('Async', () => {
    beforeEach(() => {
      cache.clear({ all: true })
    })
    after(() => {
      cache.clear({ all: true })
    })
    it('should exist', () => {
      assert.strictEqual(!!cache, true)
    })
    it('should have method has', () => {
      assert.strictEqual(typeof cache.has, 'function')
    })
    it('should have method read', () => {
      assert.strictEqual(typeof cache.read, 'function')
    })
    it('should have method write', () => {
      assert.strictEqual(typeof cache.write, 'function')
    })
    it('should have method clear', () => {
      assert.strictEqual(typeof cache.clear, 'function')
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
      assert.strictEqual(retrieved, 'async-generated-value')
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
      assert.strictEqual(retrieved, 'async-generated-value-1')
      assert.strictEqual(generatorCalled, 1)
      for (let i = 0; i < 5; i++) {
        const cached = await cache.read(key, _generate)
        assert.strictEqual(cached, 'async-generated-value-1')
        assert.strictEqual(generatorCalled, 1)
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
      assert.strictEqual(retrieved, 'async-generated-value-1')
      assert.strictEqual(generatorCalled, 1)
      await _wait(50)
      const retrieved2 = await cache.read(key, _generate)
      assert.strictEqual(retrieved2, 'async-generated-value-2')
      const retrieved3 = await cache.read(key, _generate)
      assert.strictEqual(retrieved3, 'async-generated-value-2')
    })
    it('should set never expire if expireInterval is zero', async () => {
      const val = 'never expire'
      const initial = await cache.read('non-expiring', () => val, {
        expiresInterval: 0
      })
      assert.strictEqual(initial, val)
      await _wait(50)
      const after = await cache.read('non-expiring', () => 'another value')
      assert.strictEqual(after, val)
    })
  })

  describe('Sync', () => {
    beforeEach(() => {
      cache.clear({ all: true })
    })
    after(() => {
      cache.clear({ all: true })
    })
    it('should have read function', () => {
      assert.strictEqual(typeof cache.sync.read, 'function')
    })
    it('should have write function', () => {
      assert.strictEqual(typeof cache.sync.write, 'function')
    })
    it('should have clear function', () => {
      assert.strictEqual(typeof cache.sync.clear, 'function')
    })
    it('should have has function', () => {
      assert.strictEqual(typeof cache.sync.has, 'function')
    })
    it('write should be the same as async', () => {
      assert.strictEqual(cache.sync.write, cache.write)
    })
    it('has should be the same as async', () => {
      assert.strictEqual(cache.sync.has, cache.has)
    })
    it('clear should be the same as async', () => {
      assert.strictEqual(cache.sync.clear, cache.clear)
    })
    it('read should not be the same as async', () => {
      assert.notEqual(cache.sync.read, cache.read)
    })
    it('read should call factory function if key does not exists', () => {
      let called = false
      const factory = () => {
        called = true
      }
      cache.sync.read('non-existent-key', factory)
      assert.strictEqual(called, true)
    })
    it('read should not call factory if key exists', () => {
      let called = 0
      const factory = () => {
        called += 1
        return 'value'
      }
      const value1 = cache.sync.read('non-existent-key', factory)
      assert.strictEqual(value1, 'value')
      assert.strictEqual(called, 1)
      const shouldBeValue = cache.sync.read('non-existent-key', factory)
      assert.strictEqual(shouldBeValue, 'value')
      assert.strictEqual(called, 1)
    })
    it('read should call factory if cache expires', async () => {
      let called = 0
      const factory = () => {
        called += 1
        return `value${called}`
      }
      const value1 = cache.sync.read('my-key', factory, { expiresInterval: 10 })
      assert.strictEqual(value1, 'value1')
      assert.strictEqual(called, 1)
      const value2 = cache.sync.read('my-key')
      assert.strictEqual(value2, 'value1')
      assert.strictEqual(called, 1)
      await _wait(12)
      const value3 = cache.sync.read('my-key', factory)
      assert.strictEqual(value3, 'value2')
      assert.strictEqual(called, 2)
    })
    it('should set never expire if expireInterval is zero', async () => {
      const val = 'never expire'
      const initial = cache.sync.read('non-expiring', () => val, {
        expiresInterval: 0
      })
      assert.strictEqual(initial, val)
      await _wait(10)
      const after = cache.sync.read('non-expiring', () => 'another value')
      assert.strictEqual(after, val)
    })
  })
})
