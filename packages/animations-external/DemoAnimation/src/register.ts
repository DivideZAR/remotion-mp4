import React from 'react'
import { DemoAnimation } from './Composition'
import { PropsSchema, defaultProps } from './props'

interface ExternalComposition {
  id: string
  component: React.FC<any>
  defaultProps: Record<string, unknown>
  propsSchema: any
  width: number
  height: number
  fps: number
  durationInFrames: number
}

export function registerExternalCompositions(): ExternalComposition[] {
  return [
    {
      id: 'DemoAnimation',
      component: DemoAnimation as React.FC<any>,
      defaultProps: defaultProps,
      propsSchema: PropsSchema,
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 90,
    },
  ]
}
