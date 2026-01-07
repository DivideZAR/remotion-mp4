import {ExternalComposition} from '@remotion-mp4/core'
import {PropsSchema} from './props'
import {${COMPONENT_NAME}} from './Composition'

export function registerExternalCompositions() {
  return [
    {
      id: '${COMPONENT_NAME}',
      component: ${COMPONENT_NAME},
      defaultProps: ${COMPONENT_NAME}.defaultProps,
      propsSchema: PropsSchema,
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 90
    }
  ]
}
