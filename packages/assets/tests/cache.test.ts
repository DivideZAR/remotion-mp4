import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import {
  getCachedAsset,
  setCachedAsset,
  deleteCachedAsset,
  clearAssetCache,
  getCacheStats,
  hasCachedAsset,
  getCacheKeys
} from '../src/cache'
import {Asset} from '@remotion-mp4/core'

const mockAsset: Asset = {
  type: 'image',
  path: 'test.jpg',
  format: 'jpg',
  sizeBytes: 1024,
  mimeType: 'image/jpeg'
}

describe('Cache', () => {
  beforeEach(() => {
    clearAssetCache()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearAssetCache()
  })

  describe('setCachedAsset and getCachedAsset', () => {
    it('should set and get cached asset', () => {
      setCachedAsset('test-key', mockAsset)

      const cached = getCachedAsset('test-key')

      expect(cached).toEqual(mockAsset)
    })

    it('should return undefined for non-existent key', () => {
      const cached = getCachedAsset('non-existent')

      expect(cached).toBeUndefined()
    })

    it('should overwrite existing cache entry', () => {
      setCachedAsset('test-key', mockAsset)

      const newAsset = {...mockAsset, sizeBytes: 2048}
      setCachedAsset('test-key', newAsset)

      const cached = getCachedAsset('test-key')

      expect(cached).toEqual(newAsset)
    })
  })

  describe('deleteCachedAsset', () => {
    it('should delete cached asset', () => {
      setCachedAsset('test-key', mockAsset)

      deleteCachedAsset('test-key')

      const cached = getCachedAsset('test-key')

      expect(cached).toBeUndefined()
    })

    it('should handle deleting non-existent key', () => {
      expect(() => deleteCachedAsset('non-existent')).not.toThrow()
    })
  })

  describe('clearAssetCache', () => {
    it('should clear all cached assets', () => {
      setCachedAsset('key1', mockAsset)
      setCachedAsset('key2', mockAsset)
      setCachedAsset('key3', mockAsset)

      expect(getCacheKeys()).toHaveLength(3)

      clearAssetCache()

      expect(getCacheKeys()).toHaveLength(0)
    })
  })

  describe('hasCachedAsset', () => {
    it('should return true for existing asset', () => {
      setCachedAsset('test-key', mockAsset)

      expect(hasCachedAsset('test-key')).toBe(true)
    })

    it('should return false for non-existent asset', () => {
      expect(hasCachedAsset('non-existent')).toBe(false)
    })
  })

  describe('getCacheKeys', () => {
    it('should return all cache keys', () => {
      setCachedAsset('key1', mockAsset)
      setCachedAsset('key2', mockAsset)
      setCachedAsset('key3', mockAsset)

      const keys = getCacheKeys()

      expect(keys).toHaveLength(3)
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys).toContain('key3')
    })

    it('should return empty array when cache is empty', () => {
      const keys = getCacheKeys()

      expect(keys).toEqual([])
    })
  })

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      setCachedAsset('key1', mockAsset)

      const stats = getCacheStats()

      expect(stats).toHaveProperty('size')
      expect(stats).toHaveProperty('maxSize')
      expect(stats.size).toBe(1)
      expect(stats.maxSize).toBe(100)
    })
  })
})
