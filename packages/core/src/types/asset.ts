import {z} from 'zod'

/**
 * Asset type
 */
export type AssetType = 'image' | 'video' | 'audio'

/**
 * Supported image formats
 */
export const ImageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const

/**
 * Supported video formats
 */
export const VideoFormats = ['mp4', 'webm', 'mov'] as const

/**
 * Supported audio formats
 */
export const AudioFormats = ['mp3', 'wav', 'ogg'] as const

/**
 * Asset format
 */
export type AssetFormat =
  | (typeof ImageFormats)[number]
  | (typeof VideoFormats)[number]
  | (typeof AudioFormats)[number]

/**
 * Asset metadata
 */
export interface Asset {
  type: AssetType
  path: string
  format: AssetFormat
  width?: number
  height?: number
  duration?: number
  sizeBytes: number
  mimeType: string
}

/**
 * Asset validation result
 */
export interface AssetValidationResult {
  valid: boolean
  asset?: Asset
  error?: string
}

/**
 * Asset size limits
 */
export const AssetSizeLimits = {
  image: 10 * 1024 * 1024, // 10MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 100 * 1024 * 1024 // 100MB
}

/**
 * Map file extension to asset type
 */
export function getAssetTypeFromExtension(ext: string): AssetType | null {
  const lowerExt = ext.toLowerCase().replace(/^\./, '')

  if (ImageFormats.includes(lowerExt as any)) {
    return 'image'
  }

  if (VideoFormats.includes(lowerExt as any)) {
    return 'video'
  }

  if (AudioFormats.includes(lowerExt as any)) {
    return 'audio'
  }

  return null
}

/**
 * Get MIME type from format
 */
export function getMimeType(format: AssetFormat, type: AssetType): string {
  switch (type) {
    case 'image':
      return `image/${format}`
    case 'video':
      return `video/${format === 'mov' ? 'quicktime' : format}`
    case 'audio':
      return `audio/${format === 'wav' ? 'wav' : format}`
  }
}

/**
 * Validate Asset schema
 */
export const AssetSchema: z.ZodType<Asset> = z.object({
  type: z.enum(['image', 'video', 'audio']),
  path: z.string().min(1),
  format: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  sizeBytes: z.number().int().positive(),
  mimeType: z.string()
})

/**
 * Validate asset size against limits
 */
export function validateAssetSize(type: AssetType, sizeBytes: number): boolean {
  const limit = AssetSizeLimits[type]
  return sizeBytes <= limit
}
