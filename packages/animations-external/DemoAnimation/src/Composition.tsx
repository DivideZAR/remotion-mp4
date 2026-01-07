import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'
import { Props } from './props'

export const DemoAnimation: React.FC<Props> = ({
  text,
  color,
  fontSize
}) => {
  const frame = useCurrentFrame()

  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  // Scale animation
  const scale = interpolate(frame, [0, 45], [0.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  // Slide up animation
  const translateY = interpolate(frame, [0, 45], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e'
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale}) translateY(${translateY}px)`,
          color,
          fontSize: `${fontSize}px`,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        {text}
      </div>
    </div>
  )
}

DemoAnimation.defaultProps = {
  text: 'Hello World',
  color: '#3498db',
  fontSize: 72
}
