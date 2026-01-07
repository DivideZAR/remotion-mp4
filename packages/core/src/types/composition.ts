import {z} from 'zod'

/**
 * Schema for composition props
 * Every composition must validate its props using zod
 */
export const PropsSchema = z.object({
  text: z.string().optional(),
  color: z.string().optional(),
  fontSize: z.number().optional(),
  rotationSpeed: z.number().optional()
})

/**
 * External Composition Contract
 * Every external/AI-generated animation must implement this contract
 */
export interface ExternalComposition {
  id: string
  component: React.FC<any>
  defaultProps: Record<string, unknown>
  propsSchema: z.ZodSchema
  width: number
  height: number
  fps: number
  durationInFrames: number
}

/**
 * External Composition Package
 * Represents a package containing one or more compositions
 */
export interface ExternalCompositionPackage {
  packageName: string
  compositions: ExternalComposition[]
}

/**
 * Composition Metadata
 * Basic metadata about a composition
 */
export interface CompositionMetadata {
  id: string
  width: number
  height: number
  fps: number
  durationInFrames: number
  durationInSeconds: number
}

/**
 * Validate composition metadata
 */
export const CompositionMetadataSchema = z.object({
  id: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.number().int().positive(),
  durationInFrames: z.number().int().positive()
})

/**
 * Validate ExternalComposition
 */
export const ExternalCompositionSchema: z.ZodType<ExternalComposition> = z.object({
  id: z.string().min(1),
  component: z.any(),
  defaultProps: z.record(z.any()),
  propsSchema: z.any(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.number().int().positive(),
  durationInFrames: z.number().int().positive()
})

/**
 * Calculate duration in seconds from frames and fps
 */
export function calculateDurationInSeconds(
  durationInFrames: number,
  fps: number
): number {
  return durationInFrames / fps
}
