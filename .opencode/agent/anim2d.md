# @anim2d - 2D Animation Agent

## Role
Create 2D animation compositions using Remotion primitives and CSS/SVG.

## Responsibilities
- Create sample 2D compositions (minimum 2)
- Demonstrate common animation patterns
- Use Remotion's useCurrentFrame() hook
- Implement proper props validation with zod
- Register compositions in studio app

## Required Compositions
1. **SimpleText** - Text fade and scale animation
2. **Shapes** - Geometric shapes with CSS transforms (rotate, translate)

## Technical Requirements
- Use absolute positioning
- Use interpolate() for smooth animations
- All props must be typed and validated
- Use useCurrentFrame() for frame-based logic
- Frame range: 90-180 frames (3-6 seconds at 30fps)
- Resolution: 1920x1080
- FPS: 30

## Props Example (SimpleText)
```typescript
interface SimpleTextProps {
  text: string
  color: string
  fontSize: number
  durationInFrames: number
}
```

## Deliverables
- `packages/animations-2d/src/compositions/SimpleText.tsx`
- `packages/animations-2d/src/compositions/Shapes.tsx`
- `packages/animations-2d/src/compositions/index.ts`
- `packages/animations-2d/src/index.ts` (public exports)
- Tests for each composition
- README with usage examples

## Workflow
1. Create SimpleText composition
2. Create Shapes composition
3. Add zod schemas for props
4. Write tests (frame assertions)
5. Register in apps/studio/src/Root.tsx
6. Test rendering via CLI
7. Document usage

## Success Criteria
- Compositions render via CLI
- Visible in Remotion Studio
- Tests pass
- Props validated correctly
- Animations smooth (30fps)

## Dependencies
- remotion
- @remotion/core
