import {
  Asset,
  AssetType,
  AssetFormat,
  AssetValidationResult,
  AssetSizeLimits,
  ImageFormats,
  VideoFormats,
  AudioFormats,
  getAssetTypeFromExtension,
  getMimeType,
  validateAssetSize,
  AssetSchema
} from '@remotion-mp4/core'
import {stat, readFile} from 'fs/promises'
import {extname, join, resolve, isAbsolute} from 'path'
import {logger} from '@remotion-mp4/core'

export async function validateAsset(
  path: string,
  expectedType?: AssetType
): Promise<AssetValidationResult> {
  try {
    const stats = await stat(path)

    if (!stats.isFile()) {
      return {
        valid: false,
        error: `Path is not a file: ${path}`
      }
    }

    const extension = extname(path).substring(1).toLowerCase()
    const detectedType = getAssetTypeFromExtension(extension)

    if (!detectedType) {
      return {
        valid: false,
        error: `Unsupported file extension: .${extension}`
      }
    }

    if (expectedType && detectedType !== expectedType) {
      return {
        valid: false,
        error: `Expected type ${expectedType}, but detected ${detectedType}`
      }
    }

    const sizeBytes = stats.size

    if (!validateAssetSize(detectedType, sizeBytes)) {
      const limit = AssetSizeLimits[detectedType] / 1024 / 1024
      return {
        valid: false,
        error: `File size (${(sizeBytes / 1024 / 1024).toFixed(2)}MB) exceeds limit for ${detectedType} (${limit}MB)`
      }
    }

    const mimeType = getMimeType(
      extension as AssetFormat,
      detectedType
    )

    let width: number | undefined
    let height: number | undefined
    let duration: number | undefined

    if (detectedType === 'image') {
      try {
        const imageData = await readFile(path, 'base64')
        width = await getImageWidth(imageData)
        height = await getImageHeight(imageData)
      } catch {
        logger.debug(`Could not read image dimensions: ${path}`)
      }
    }

    if (detectedType === 'video') {
      duration = await getVideoDuration(path)
    }

    if (detectedType === 'audio') {
      duration = await getAudioDuration(path)
    }

    const asset: Asset = {
      type: detectedType,
      path,
      format: extension as AssetFormat,
      sizeBytes,
      mimeType,
      width,
      height,
      duration
    }

    try {
      AssetSchema.parse(asset)
    } catch (error) {
      return {
        valid: false,
        error: `Asset validation failed: ${error}`
      }
    }

    logger.info(`Asset validated: ${path} (${detectedType}, ${sizeBytes} bytes)`)

    return {
      valid: true,
      asset
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error)
    logger.error(`Asset validation error: ${path} - ${errorMessage}`)

    return {
      valid: false,
      error: errorMessage
    }
  }
}

export async function validateAssetList(
  paths: string[],
  expectedType?: AssetType
): Promise<AssetValidationResult[]> {
  const results: AssetValidationResult[] = []

  for (const path of paths) {
    const result = await validateAsset(path, expectedType)
    results.push(result)
  }

  return results
}

async function getImageWidth(base64Data: string): Promise<number | undefined> {
  return undefined
}

async function getImageHeight(base64Data: string): Promise<number | undefined> {
  return undefined
}

async function getVideoDuration(path: string): Promise<number | undefined> {
  return undefined
}

async function getAudioDuration(path: string): Promise<number | undefined> {
  return undefined
}

export function isAssetPathValid(path: string): boolean {
  const extension = extname(path).toLowerCase()

  const imageFormats = [...ImageFormats].map((f) => `.${f}`)
  const videoFormats = [...VideoFormats].map((f) => `.${f}`)
  const audioFormats = [...AudioFormats].map((f) => `.${f}`)

  return (
    imageFormats.includes(extension) ||
    videoFormats.includes(extension) ||
    audioFormats.includes(extension)
  )
}
