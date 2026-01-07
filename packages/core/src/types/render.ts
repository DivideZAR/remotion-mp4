import {z} from 'zod'

/**
 * Codec options for video rendering
 */
export type VideoCodec = 'h264' | 'vp8' | 'vp9' | 'prores'

/**
 * WebGL context mode
 */
export type WebGLMode = 'angle' | 'swangle' | 'swiftshader' | 'egl'

/**
 * Chromium options for SSR rendering
 */
export interface ChromiumOptions {
  gl?: WebGLMode
  headless?: boolean
  ignoreDefaultArgs?: boolean
}

/**
 * Render options for SSR rendering
 */
export interface RenderOptions {
  compositionId: string
  inputProps?: Record<string, unknown>
  outputPath: string
  codec?: VideoCodec
  chromiumOptions?: ChromiumOptions
  concurrency?: number
  timeoutInMilliseconds?: number
  maxDurationSeconds?: number
}

/**
 * Render result
 * Standardized output from render operation
 */
export interface RenderResult {
  success: boolean
  outputPath?: string
  duration?: number
  sizeBytes?: number
  codec?: VideoCodec
  error?: string
  renderTimeMs?: number
}

/**
 * Bundle options
 */
export interface BundleOptions {
  compositionId: string
  inputProps?: Record<string, unknown>
  webpackOverride?: any
}

/**
 * Validate RenderOptions
 */
export const RenderOptionsSchema = z.object({
  compositionId: z.string().min(1),
  inputProps: z.record(z.any()).optional(),
  outputPath: z.string().min(1),
  codec: z.enum(['h264', 'vp8', 'vp9', 'prores']).default('h264'),
  chromiumOptions: z
    .object({
      gl: z.enum(['angle', 'swangle', 'swiftshader', 'egl']).optional()
    })
    .optional(),
  concurrency: z.number().int().positive().optional(),
  timeoutInMilliseconds: z.number().int().positive().optional(),
  maxDurationSeconds: z.number().int().positive().optional()
})

/**
 * Default render options
 */
export const DefaultRenderOptions: Partial<RenderOptions> = {
  codec: 'h264',
  concurrency: 1,
  timeoutInMilliseconds: 120000, // 2 minutes
  maxDurationSeconds: 60
}

/**
 * Get default WebGL mode based on platform
 */
export function getDefaultWebGLMode(): WebGLMode {
  const platform = process.platform

  if (platform === 'darwin' || platform === 'win32') {
    return 'angle'
  }

  // Linux/CI should use swangle
  return 'swangle'
}
