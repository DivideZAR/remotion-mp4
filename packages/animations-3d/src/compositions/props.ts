import {z} from 'zod'

export const RotatingCubePropsSchema = z.object({
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#00ff00'),
  rotationSpeed: z.number().int().positive().max(3).default(1)
})
