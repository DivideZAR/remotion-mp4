import {join, resolve, isAbsolute} from 'path'
import {existsSync} from 'fs'
import {logger} from '@remotion-mp4/core'

const ASSET_BASE_PATHS = [
  'public',
  'assets',
  process.cwd()
]

export function resolveAssetPath(assetPath: string): string {
  if (isAbsolute(assetPath)) {
    logger.debug(`Using absolute path: ${assetPath}`)
    return assetPath
  }

  const cwd = process.cwd()

  for (const basePath of ASSET_BASE_PATHS) {
    const fullPath = join(cwd, basePath, assetPath)

    if (existsSync(fullPath)) {
      logger.debug(`Resolved asset path: ${fullPath}`)
      return fullPath
    }
  }

  const defaultPath = join(cwd, 'public', assetPath)
  logger.debug(`Using default asset path: ${defaultPath}`)

  return defaultPath
}

export function resolvePublicPath(publicPath: string): string {
  const cwd = process.cwd()
  return join(cwd, 'public', publicPath)
}

export function getAssetUrl(path: string): string {
  if (isAbsolute(path)) {
    return path
  }

  return `/${path}`
}

export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/')
}

export function ensurePublicDirectory(): void {
  const cwd = process.cwd()
  const publicDir = join(cwd, 'public')

  if (!existsSync(publicDir)) {
    logger.debug(`Public directory does not exist: ${publicDir}`)
  }
}
