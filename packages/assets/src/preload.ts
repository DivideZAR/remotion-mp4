import {delayRender, continueRender} from 'remotion'
import {resolveAssetPath} from './resolver'
import {logger} from '@remotion-mp4/core'
import {resolveAssetPath as resolvePath} from './resolver'

export async function preloadImage(path: string): Promise<void> {
  const handle = delayRender()

  try {
    logger.debug(`Preloading image: ${path}`)

    const resolvedPath = resolvePath(path)

    await new Promise<void>((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        logger.info(`Image loaded: ${path}`)
        resolve()
      }

      img.onerror = () => {
        const error = new Error(`Failed to load image: ${path}`)
        logger.error(error.message)
        reject(error)
      }

      img.src = resolvedPath
    })
  } catch (error) {
    logger.error(`Image preload error: ${error}`)
    throw error
  } finally {
    continueRender(handle)
  }
}

export async function preloadVideo(path: string): Promise<void> {
  const handle = delayRender()

  try {
    logger.debug(`Preloading video: ${path}`)

    const resolvedPath = resolvePath(path)

    await new Promise<void>((resolve, reject) => {
      const video = document.createElement('video')

      video.onloadeddata = () => {
        logger.info(`Video loaded: ${path}`)
        resolve()
      }

      video.onerror = () => {
        const error = new Error(`Failed to load video: ${path}`)
        logger.error(error.message)
        reject(error)
      }

      video.src = resolvedPath
    })
  } catch (error) {
    logger.error(`Video preload error: ${error}`)
    throw error
  } finally {
    continueRender(handle)
  }
}

export async function preloadAudio(path: string): Promise<void> {
  const handle = delayRender()

  try {
    logger.debug(`Preloading audio: ${path}`)

    const resolvedPath = resolvePath(path)

    await new Promise<void>((resolve, reject) => {
      const audio = new Audio()

      audio.oncanplaythrough = () => {
        logger.info(`Audio loaded: ${path}`)
        resolve()
      }

      audio.onerror = () => {
        const error = new Error(`Failed to load audio: ${path}`)
        logger.error(error.message)
        reject(error)
      }

      audio.src = resolvedPath
    })
  } catch (error) {
    logger.error(`Audio preload error: ${error}`)
    throw error
  } finally {
    continueRender(handle)
  }
}

export async function preloadAsset(
  type: 'image' | 'video' | 'audio',
  path: string
): Promise<void> {
  switch (type) {
    case 'image':
      return preloadImage(path)
    case 'video':
      return preloadVideo(path)
    case 'audio':
      return preloadAudio(path)
    default:
      throw new Error(`Unknown asset type: ${type}`)
  }
}

export async function preloadAssets(
  assets: {type: 'image' | 'video' | 'audio'; path: string}[]
): Promise<void> {
  logger.info(`Preloading ${assets.length} asset(s)...`)

  const promises = assets.map((asset) => preloadAsset(asset.type, asset.path))

  try {
    await Promise.all(promises)
    logger.info(`All assets preloaded successfully`)
  } catch (error) {
    logger.error(`Some assets failed to preload: ${error}`)
    throw error
  }
}

export function preloadAssetSync(
  type: 'image' | 'video' | 'audio',
  path: string
): void {
  const resolvedPath = resolveAssetPath(path)

  logger.debug(`Preloading ${type} (sync): ${resolvedPath}`)

  switch (type) {
    case 'image':
      const img = new Image()
      img.src = resolvedPath
      break
    case 'video':
      logger.warn(`Video preload in browser is async, use preloadVideo()`)
      break
    case 'audio':
      logger.warn(`Audio preload in browser is async, use preloadAudio()`)
      break
  }
}
