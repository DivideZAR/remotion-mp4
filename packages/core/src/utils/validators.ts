import {z} from 'zod'

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate data using zod schema
 */
export function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  fieldName?: string
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      const message = firstError
        ? `${fieldName ? `${fieldName}: ` : ''}${firstError.message}`
        : 'Validation failed'
      throw new ValidationError(message, fieldName || firstError?.path.join('.'))
    }
    throw error
  }
}

/**
 * Check if value is a valid composition ID
 */
export function isValidCompositionId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id)
}

/**
 * Validate composition ID
 */
export function validateCompositionId(id: string): void {
  if (!isValidCompositionId(id)) {
    throw new ValidationError(
      `Invalid composition ID: "${id}". Must be alphanumeric with hyphens and underscores only.`,
      'compositionId'
    )
  }
}

/**
 * Check if file path is valid
 */
export function isValidFilePath(path: string): boolean {
  if (typeof path !== 'string' || path.length === 0) {
    return false
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*]/
  if (invalidChars.test(path)) {
    return false
  }

  return true
}

/**
 * Validate file path
 */
export function validateFilePath(path: string, fieldName?: string): void {
  if (!isValidFilePath(path)) {
    throw new ValidationError(
      `Invalid file path: "${path}". Contains invalid characters.`,
      fieldName || 'path'
    )
  }
}

/**
 * Check if number is positive integer
 */
export function isPositiveInteger(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

/**
 * Validate positive integer
 */
export function validatePositiveInteger(
  value: unknown,
  fieldName: string
): void {
  if (!isPositiveInteger(value)) {
    throw new ValidationError(
      `${fieldName} must be a positive integer, got: ${value}`,
      fieldName
    )
  }
}

/**
 * Check if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Validate range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (!isInRange(value, min, max)) {
    throw new ValidationError(
      `${fieldName} must be between ${min} and ${max}, got: ${value}`,
      fieldName
    )
  }
}

/**
 * Validate FPS
 */
export function validateFPS(fps: number): void {
  const validFPS = [1, 24, 25, 30, 50, 60]
  if (!validFPS.includes(fps)) {
    throw new ValidationError(
      `Invalid FPS: ${fps}. Must be one of: ${validFPS.join(', ')}`,
      'fps'
    )
  }
}

/**
 * Validate video codec
 */
export function validateCodec(codec: string): void {
  const validCodecs = ['h264', 'vp8', 'vp9', 'prores']
  if (!validCodecs.includes(codec)) {
    throw new ValidationError(
      `Invalid codec: ${codec}. Must be one of: ${validCodecs.join(', ')}`,
      'codec'
    )
  }
}

/**
 * Validate WebGL mode
 */
export function validateWebGLMode(mode: string): void {
  const validModes = ['angle', 'swangle', 'swiftshader', 'egl']
  if (!validModes.includes(mode)) {
    throw new ValidationError(
      `Invalid WebGL mode: ${mode}. Must be one of: ${validModes.join(', ')}`,
      'gl'
    )
  }
}

/**
 * Sanitize string for safe usage
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
