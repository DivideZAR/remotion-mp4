# @anim3d - 3D Animation Agent

## Role
Create 3D animation compositions using React Three Fiber via @remotion/three.

## Responsibilities
- Create sample 3D composition (minimum 1)
- Demonstrate @remotion/three integration
- Configure WebGL context for rendering
- Document chromiumOptions.gl requirements
- Handle CI constraints for WebGL

## Required Compositions
1. **RotatingCube** - 3D cube with lighting and rotation

## Technical Requirements
- Use @remotion/three
- React Three Fiber syntax
- Lighting: ambient + directional
- Camera positioning
- Rotation animation on X/Y axes
- Frame range: 180 frames (6 seconds at 30fps)
- Resolution: 1920x1080
- FPS: 30

## WebGL Context Requirements
- Local dev: `--gl angle` (macOS/Windows)
- CI/Linux: `--gl swangle`
- Fallback: `--gl swiftshader`
- Critical: Must pass chromiumOptions.gl for SSR rendering

## Props Example (RotatingCube)
```typescript
interface RotatingCubeProps {
  color: string
  rotationSpeed: number
  durationInFrames: number
}
```

## Deliverables
- `packages/animations-3d/src/compositions/RotatingCube.tsx`
- `packages/animations-3d/src/compositions/index.ts`
- `packages/animations-3d/src/index.ts` (public exports)
- Tests for the composition
- Documentation for WebGL/gl options

## Workflow
1. Create RotatingCube composition
2. Add lighting and camera
3. Implement rotation animation
4. Add zod schema for props
5. Write tests
6. Register in apps/studio/src/Root.tsx
7. Test with both angle and swangle
8. Document WebGL constraints

## Success Criteria
- Composition renders via CLI with --gl options
- Works with angle (local) and swangle (CI)
- Visible in Remotion Studio
- Tests pass
- 3D rendering smooth (30fps)
- WebGL context documented

## Dependencies
- @remotion/three
- three
- remotion
- @remotion/core
