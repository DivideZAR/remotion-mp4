import {z} from 'zod'

export const PropsSchema = z.object({
  text: z.string().default('Hello World'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ffffff'),
  fontSize: z.number().int().positive().max(200).default(60),
  color3d: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#00ff00'),
  rotationSpeed: z.number().int().positive().max(3).default(1)
})
