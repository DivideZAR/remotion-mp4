import React from 'react'
import {useCurrentFrame, interpolate} from 'remotion'
import {PropsSchema} from './props'

interface ${COMPONENT_NAME}Props {
  text: string
  color: string
  fontSize: number
  durationInFrames: number
}

export const ${COMPONENT_NAME}: React.FC<${COMPONENT_NAME}Props> = ({
  text = 'Hello World',
  color = '#ffffff',
  fontSize = 60,
  durationInFrames
}) => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 30, 60, 90], [0, 1, 1, 0])
  const scale = interpolate(frame, [0, 45], [0.5, 1])

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e'
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          color,
          opacity,
          transform: `scale(${scale})`,
          textShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        {text}
      </div>
    </div>
  )
}

${COMPONENT_NAME}.defaultProps = {
  text: 'Hello World',
  color: '#ffffff',
  fontSize: 60
}

${COMPONENT_NAME}.propsSchema = PropsSchema
