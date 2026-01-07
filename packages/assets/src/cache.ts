import {Asset} from '@remotion-mp4/core'
import {stat} from 'fs/promises'
import {logger} from '@remotion-mp4/core'

interface CacheEntry {
  asset: Asset
  timestamp: number
}

class AssetCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number = 100

  set(key: string, asset: Asset): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      asset,
      timestamp: Date.now()
    })

    logger.debug(`Asset cached: ${key}`)
  }

  get(key: string): Asset | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    return entry.asset
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
    logger.debug(`Asset removed from cache: ${key}`)
  }

  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    logger.info(`Asset cache cleared (${size} entries)`)
  }

  evictOldest(): void {
    let oldestKey: string | undefined
    let oldestTimestamp = Infinity

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      logger.debug(`Evicted oldest cache entry: ${oldestKey}`)
    }
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  getCacheStats(): {
    size: number
    maxSize: number
    oldestEntry: CacheEntry | undefined
    newestEntry: CacheEntry | undefined
  } {
    const entries = Array.from(this.cache.values())

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      oldestEntry: entries.reduce(
        (oldest, current) =>
          current.timestamp < oldest.timestamp ? current : oldest,
        entries[0]
      ),
      newestEntry: entries.reduce(
        (newest, current) =>
          current.timestamp > newest.timestamp ? current : newest,
        entries[0]
      )
    }
  }
}

const assetCache = new AssetCache()

export async function generateCacheKey(path: string): Promise<string> {
  try {
    const stats = await stat(path)
    const key = `${path}-${stats.mtimeMs}`

    return key
  } catch {
    logger.debug(`Could not get stats for cache key: ${path}`)
    return path
  }
}

export function getCachedAsset(key: string): Asset | undefined {
  return assetCache.get(key)
}

export function setCachedAsset(key: string, asset: Asset): void {
  assetCache.set(key, asset)
}

export function deleteCachedAsset(key: string): void {
  assetCache.delete(key)
}

export function clearAssetCache(): void {
  assetCache.clear()
}

export function getCacheStats() {
  return assetCache.getCacheStats()
}

export function hasCachedAsset(key: string): boolean {
  return assetCache.has(key)
}

export function getCacheKeys(): string[] {
  return assetCache.keys()
}
