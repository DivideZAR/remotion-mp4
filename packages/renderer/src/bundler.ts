import {createHash} from 'crypto'
import {readFile, stat, writeFile, mkdir, rm} from 'fs/promises'
import {existsSync} from 'fs'
import {join} from 'path'
import {bundle} from '@remotion/bundler'
import {logger} from '@remotion-mp4/core'

export interface BundleOptions {
  compositionId: string
  inputProps?: Record<string, unknown>
  webpackOverride?: any
}

export interface BundleResult {
  bundlePath: string
  cached: boolean
}

const CACHE_DIR = '.cache/bundles'

export async function ensureCacheDir(): Promise<void> {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, {recursive: true})
  }
}

export function generateCacheKey(
  compositionId: string,
  inputProps?: Record<string, unknown>,
  sourceHash?: string
): string {
  const hash = createHash('sha256')

  hash.update(compositionId)

  if (inputProps) {
    hash.update(JSON.stringify(inputProps))
  }

  if (sourceHash) {
    hash.update(sourceHash)
  }

  return hash.digest('hex').substring(0, 16)
}

export async function getSourceFileHash(
  entryPoint: string
): Promise<string | undefined> {
  try {
    const stats = await stat(entryPoint)
    const hash = createHash('md5')
    hash.update(stats.mtimeMs.toString())
    return hash.digest('hex')
  } catch {
    return undefined
  }
}

export async function getCachedBundle(
  cacheKey: string
): Promise<BundleResult | null> {
  const cachePath = join(CACHE_DIR, `${cacheKey}.js`)

  if (!existsSync(cachePath)) {
    return null
  }

  logger.debug(`Found cached bundle: ${cacheKey}`)
  return {bundlePath: cachePath, cached: true}
}

export async function saveCachedBundle(
  cacheKey: string,
  bundleContent: string
): Promise<void> {
  const cachePath = join(CACHE_DIR, `${cacheKey}.js`)
  await writeFile(cachePath, bundleContent)
  logger.debug(`Cached bundle: ${cacheKey}`)
}

export async function clearCache(): Promise<void> {
  if (existsSync(CACHE_DIR)) {
    await rm(CACHE_DIR, {recursive: true, force: true})
    await mkdir(CACHE_DIR, {recursive: true})
    logger.info('Bundle cache cleared')
  }
}

export async function bundleComposition(
  options: BundleOptions
): Promise<BundleResult> {
  const {compositionId, inputProps, webpackOverride} = options

  logger.info(`Bundling composition: ${compositionId}`)

  await ensureCacheDir()

  const cacheKey = generateCacheKey(compositionId, inputProps)

  const cached = await getCachedBundle(cacheKey)
  if (cached) {
    return cached
  }

  logger.info('Creating new bundle...')

  try {
    const result = await bundle({
      entryPoint: 'packages/animations-2d/src/index.ts',
      webpackOverride: webpackOverride || {}
    })

    await saveCachedBundle(cacheKey, result)

    logger.info('Bundle created successfully')

    return {bundlePath: result, cached: false}
  } catch (error) {
    logger.error(`Failed to bundle composition: ${error}`)
    throw new Error(`Bundle failed: ${error}`)
  }
}
