import React from 'react'

export { DemoAnimation } from './Composition'
export { defaultProps, PropsSchema } from './props'
export { registerExternalCompositions } from './register'

// External composition type (inline to avoid dependency on core)
export interface ExternalComposition {
  id: string
  component: React.FC<any>
  defaultProps: Record<string, unknown>
  propsSchema: any
  width: number
  height: number
  fps: number
  durationInFrames: number
}
