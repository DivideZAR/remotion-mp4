import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import {
  bundleComposition,
  BundleOptions,
  generateCacheKey,
  getCachedBundle,
  saveCachedBundle,
  clearCache,
  ensureCacheDir
} from '../src/bundler'
import {mkdir, rm, writeFile} from 'fs/promises'
import {existsSync} from 'fs'
import {join} from 'path'

const CACHE_DIR = '.cache/bundles'

vi.mock('@remotion/bundler', () => ({
  bundle: vi.fn(() => Promise.resolve('mock-bundle.js'))
}))

describe('Bundler', () => {
  beforeEach(async () => {
    if (existsSync(CACHE_DIR)) {
      await rm(CACHE_DIR, {recursive: true, force: true})
    }
  })

  afterEach(async () => {
    if (existsSync(CACHE_DIR)) {
      await rm(CACHE_DIR, {recursive: true, force: true})
    }
  })

  describe('generateCacheKey', () => {
    it('should generate consistent keys for same input', () => {
      const key1 = generateCacheKey('TestComposition', {text: 'Hello'})
      const key2 = generateCacheKey('TestComposition', {text: 'Hello'})

      expect(key1).toBe(key2)
    })

    it('should generate different keys for different input', () => {
      const key1 = generateCacheKey('TestComposition', {text: 'Hello'})
      const key2 = generateCacheKey('TestComposition', {text: 'World'})

      expect(key1).not.toBe(key2)
    })

    it('should generate different keys for different compositions', () => {
      const key1 = generateCacheKey('Composition1', {})
      const key2 = generateCacheKey('Composition2', {})

      expect(key1).not.toBe(key2)
    })
  })

  describe('ensureCacheDir', () => {
    it('should create cache directory', async () => {
      await ensureCacheDir()

      expect(existsSync(CACHE_DIR)).toBe(true)
    })
  })

  describe('saveCachedBundle and getCachedBundle', () => {
    it('should save and retrieve cached bundle', async () => {
      await ensureCacheDir()

      const cacheKey = 'test-key'
      const content = 'console.log("test")'

      await saveCachedBundle(cacheKey, content)

      const cached = await getCachedBundle(cacheKey)
      expect(cached).not.toBeNull()
      expect(cached?.cached).toBe(true)
      expect(cached?.bundlePath).toContain(cacheKey)
    })

    it('should return null for non-existent cache', async () => {
      const cached = await getCachedBundle('non-existent-key')
      expect(cached).toBeNull()
    })
  })

  describe('clearCache', () => {
    it('should clear all cached bundles', async () => {
      await ensureCacheDir()

      await saveCachedBundle('key1', 'content1')
      await saveCachedBundle('key2', 'content2')

      expect(existsSync(CACHE_DIR)).toBe(true)

      await clearCache()

      expect(existsSync(CACHE_DIR)).toBe(true)
    })
  })

  describe('bundleComposition', () => {
    it('should bundle composition', async () => {
      const options: BundleOptions = {
        compositionId: 'TestComposition',
        inputProps: {text: 'Hello'}
      }

      const result = await bundleComposition(options)

      expect(result).toHaveProperty('bundlePath')
      expect(result).toHaveProperty('cached')
    })
  })
})
