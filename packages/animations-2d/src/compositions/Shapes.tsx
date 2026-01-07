import React from 'react'
import {useCurrentFrame, interpolate} from 'remotion'
import {ShapesPropsSchema} from './props'

interface ShapesProps {
  shape: 'circle' | 'square' | 'triangle'
  color: string
  speed: number
  durationInFrames: number
}

export const Shapes: React.FC<ShapesProps> = ({
  shape = 'circle',
  color = '#ff6b6b',
  speed = 1,
  durationInFrames
}) => {
  const frame = useCurrentFrame()

  const rotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, 360 * speed]
  )
  const scale = interpolate(frame, [0, 60, durationInFrames - 60, durationInFrames], [
    0,
    1,
    1,
    0
  ])
  const xOffset = interpolate(
    frame,
    [0, durationInFrames / 2, durationInFrames],
    [-200, 200, -200]
  )

  const renderShape = () => {
    const size = 200
    const commonStyle = {
      width: size,
      height: size,
      backgroundColor: color,
      position: 'absolute',
      transform: `rotate(${rotation}deg) scale(${scale}) translateX(${xOffset}px)`,
      top: '50%',
      left: '50%',
      marginLeft: -size / 2,
      marginTop: -size / 2
    }

    if (shape === 'circle') {
      return <div style={{...commonStyle, borderRadius: '50%'}} />
    }

    if (shape === 'square') {
      return <div style={commonStyle} />
    }

    if (shape === 'triangle') {
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size / 2}px solid transparent`,
            borderRight: `${size / 2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
            position: 'absolute',
            transform: `rotate(${rotation}deg) scale(${scale}) translateX(${xOffset}px)`,
            top: '50%',
            left: '50%',
            marginLeft: -size / 2,
            marginTop: -size / 3
          }}
        />
      )
    }

    return null
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2d3436'
      }}
    >
      {renderShape()}
    </div>
  )
}

Shapes.defaultProps = {
  shape: 'circle',
  color: '#ff6b6b',
  speed: 1
}

Shapes.propsSchema = ShapesPropsSchema
