import { z } from 'zod'

export const PropsSchema = z.object({
  text: z.string().default('Hello World'),
  color: z.string().default('#3498db'),
  fontSize: z.number().default(72),
  durationInFrames: z.number().default(90)
})

export type Props = z.infer<typeof PropsSchema>

export const defaultProps: Props = {
  text: 'Hello World',
  color: '#3498db',
  fontSize: 72,
  durationInFrames: 90
}
