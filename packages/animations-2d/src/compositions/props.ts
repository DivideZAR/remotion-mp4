import {z} from 'zod'

export const PropsSchema = z.object({
  text: z.string().default('Hello Remotion'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default('#ffffff'),
  fontSize: z.number().int().positive().max(200).default(60)
})

export const ShapesPropsSchema = z.object({
  shape: z.enum(['circle', 'square', 'triangle']).default('circle'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ff6b6b'),
  speed: z.number().int().positive().max(5).default(1)
})
