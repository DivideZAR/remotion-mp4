import React from 'react'
import {useCurrentFrame, interpolate} from 'remotion'
import * as THREE from 'three'
import {Canvas} from '@remotion/three'
import {PropsSchema} from './props'

interface ${COMPONENT_NAME}Props {
  color: string
  rotationSpeed: number
  durationInFrames: number
}

export const ${COMPONENT_NAME}: React.FC<${COMPONENT_NAME}Props> = ({
  color = '#00ff00',
  rotationSpeed = 1,
  durationInFrames
}) => {
  const frame = useCurrentFrame()

  const rotationX = interpolate(frame, [0, durationInFrames], [0, Math.PI * 2 * rotationSpeed])
  const rotationY = interpolate(frame, [0, durationInFrames], [0, Math.PI * 4 * rotationSpeed])
  const scale = interpolate(frame, [0, 60, durationInFrames - 60, durationInFrames], [
    0.5,
    1,
    1,
    0.5
  ])

  return (
    <Canvas
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%'
      }}
      camera={{
        fov: 75,
        position: [0, 0, 5]
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      <mesh
        scale={scale}
        rotation={[rotationX, rotationY, 0]}
        position={[0, 0, 0]}
      >
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
    </Canvas>
  )
}

${COMPONENT_NAME}.defaultProps = {
  color: '#00ff00',
  rotationSpeed: 1
}

${COMPONENT_NAME}.propsSchema = PropsSchema
