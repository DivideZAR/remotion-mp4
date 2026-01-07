import React from 'react'
import {Composition} from 'remotion'
import {SimpleText, Shapes} from '@remotion-mp4/animations-2d'
import {RotatingCube} from '@remotion-mp4/animations-3d'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SimpleText"
        component={SimpleText}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={SimpleText.defaultProps}
        props={SimpleText.propsSchema}
      />

      <Composition
        id="Shapes"
        component={Shapes}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={Shapes.defaultProps}
        props={Shapes.propsSchema}
      />

      <Composition
        id="RotatingCube"
        component={RotatingCube}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={RotatingCube.defaultProps}
        props={RotatingCube.propsSchema}
      />
    </>
  )
}
