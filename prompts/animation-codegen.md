# Animation Code Generation Prompt

## Context
You are an AI code generation assistant. Your task is to generate a React animation component for a Remotion-based video rendering system.

## Requirements

### Component Structure

Create a React component that follows the **External Composition Contract**:

\`\`\`typescript
import React from 'react'
import {useCurrentFrame, interpolate} from 'remotion'
import * as THREE from 'three'  // Only for 3D
import {Canvas} from '@remotion/three'  // Only for 3D
import {z} from 'zod'

// 1. Define Props Schema
export const PropsSchema = z.object({
  // Define your props here (see below)
})

// 2. Define Props Interface
interface YourCompositionProps {
  // Define your props here
}

// 3. Component
export const YourComposition: React.FC<YourCompositionProps> = ({/*props*/}) => {
  // Use useCurrentFrame() for animation logic
  const frame = useCurrentFrame()

  // Implement your animation here

  return (
    // Your JSX
  )
}

// 4. Default Props
YourComposition.defaultProps = {
  // Define default values
}

// 5. Props Schema
YourComposition.propsSchema = PropsSchema

// 6. Registration Function
export function registerExternalCompositions() {
  return [
    {
      id: 'YourComposition',
      component: YourComposition,
      defaultProps: YourComposition.defaultProps,
      propsSchema: PropsSchema,
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 90
    }
  ]
}
\`\`\`

## 2D Animation Guidelines

### Technical Requirements

1. **Frame-based Animation**: Always use `useCurrentFrame()` hook for frame-based logic
2. **Interpolation**: Use `interpolate()` for smooth animations
3. **Absolute Positioning**: Use `position: 'absolute'` for layout
4. **Composition Props**:
   - Must include: `width`, `height`, `fps`, `durationInFrames`
   - Recommended: 1920x1080, 30fps, 90-180 frames (3-6 seconds)
5. **Type Safety**: Use TypeScript interfaces, zod schemas for props

### Common Patterns

\`\`\`typescript
// Fade animation
const opacity = interpolate(frame, [0, 30], [0, 1])

// Scale animation
const scale = interpolate(frame, [0, 45], [0.5, 1])

// Translation animation
const y = interpolate(frame, [0, 90], [-50, 50])
\`\`\`

### Props Schema Examples

\`\`\`typescript
export const PropsSchema = z.object({
  text: z.string().default('Hello World'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ffffff'),
  fontSize: z.number().int().positive().max(200).default(60)
})
\`\`\`

## 3D Animation Guidelines

### Technical Requirements

1. **@remotion/three**: Must use React Three Fiber via `@remotion/three`
2. **Canvas Component**: Use `<Canvas>` from `@remotion/three` (not raw three.js)
3. **Camera**: Proper camera positioning and FOV
4. **Lighting**: At least ambient + directional/point lights
5. **Materials**: Use Standard material or custom shaders
6. **WebGL Context**: Document that `--gl` flag is required for 3D renders

### Common Patterns

\`\`\`typescript
// Rotation on multiple axes
const rotationX = interpolate(frame, [0, duration], [0, Math.PI * 2])
const rotationY = interpolate(frame, [0, duration], [0, Math.PI * 4])

// Scale animation
const scale = interpolate(frame, [0, 60, duration - 60, duration], [0.5, 1, 1, 0.5])

// Camera setup
camera={{
  fov: 75,
  position: [0, 0, 5]
}}
\`\`\`

### Props Schema Examples

\`\`\`typescript
export const PropsSchema = z.object({
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#00ff00'),
  rotationSpeed: z.number().int().positive().max(3).default(1)
})
\`\`\`

## Critical Requirements

### 1. Deterministic Rendering

\`\`\`typescript
// ❌ WRONG - Non-deterministic
const randomValue = Math.random()
const x = randomValue * 10

// ✅ CORRECT - Deterministic
interface Props {
  seed: number
}
export const PropsSchema = z.object({
  seed: z.number().default(42)
})
export const MyAnimation: React.FC<Props> = ({seed}) => {
  const frame = useCurrentFrame()

  const seededRandom = (seed * 9301 + 49297) % 233280
  const x = (seededRandom / 233280) * 10

  return <div style={{transform: \`translateX(\${x}px)\`}} />
}
\`\`\`

### 2. SSR Compatibility

\`\`\`typescript
// ❌ WRONG - Will crash in Node.js
const w = window.innerWidth

// ✅ CORRECT - SSR compatible
const MyAnimation: React.FC = () => {
  const frame = useCurrentFrame()

  if (typeof window !== 'undefined') {
    const w = window.innerWidth
  }

  return <div>Content</div>
}
\`\`\`

### 3. Async Safety

\`\`\`typescript
// ❌ WRONG - May timeout or error in SSR
const data = await fetch('/api/data')
return <div>{data}</div>

// ✅ CORRECT - Use Remotion async helpers
import {delayRender, continueRender} from 'remotion'

const MyAnimation: React.FC = () => {
  const frame = useCurrentFrame()
  const handle = delayRender()

  const loadData = async () => {
    const response = await fetch('/api/data')
    const data = await response.json()
    continueRender(handle)
    return data
  }

  const data = await loadData()

  return <div>{data}</div>
}
\`\`\`

### 4. No Unsafe Code

\`\`\`typescript
// ❌ WRONG - Security risk
const code = 'alert("XSS")'
eval(code)

// ❌ WRONG - Security risk
new Function('alert("XSS")')

// ❌ WRONG - Security risk
exec('echo "XSS"')

// ❌ WRONG - SSR incompatibility
import fs from 'fs'
const data = fs.readFileSync('file.txt')

// ✅ CORRECT - Safe patterns
const safeData = JSON.parse(data)
\`\`\`

## File Structure

When generating code, create these files in a directory (e.g., `input/my-animation/`):

\`\`\`
input/my-animation/
├── Composition.tsx          # Main component
├── props.ts                 # Props schema
├── register.ts              # Registration function
└── README.md                # Documentation
\`\`\`

## Validation

After generating code, it will be validated against these guardrails:

1. ✅ No `Math.random()` at render-time
2. ✅ No `fetch()` without `delayRender/continueRender`
3. ✅ No `window`/`document` at module scope without `typeof` guard
4. ✅ No `eval()` or `new Function()`
5. ✅ No `fs` operations without `typeof window !== 'undefined'` guard
6. ✅ Props validated with Zod schema
7. ✅ Registration function exported

## Testing

Test your generated code with:

\`\`\`bash
npm run intake:validate -- --source my-animation
\`\`\`

## Rendering

After validation and import:

\`\`\`bash
# 2D animations
npm run render -- --comp MyAnimation --out out/my-anim.mp4

# 3D animations (requires --gl flag)
npm run render -- --comp My3DAnim --out out/3d.mp4 --gl swangle
\`\`\`

## Tips for Better Code

1. **Performance**: Use `useMemo()` for expensive calculations
2. **Readability**: Add comments for complex logic
3. **Maintainability**: Break large components into smaller sub-components
4. **Props**: Keep props minimal and well-documented
5. **Frame Range**: Keep animations short (3-6 seconds for optimal performance)

## Example Output

Provide the complete code in this format:

\`\`\`typescript
// File: Composition.tsx
import React from 'react'
import {useCurrentFrame, interpolate} from 'remotion'
import {z} from 'zod'

export const PropsSchema = z.object({
  text: z.string().default('Hello World'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ffffff'),
  fontSize: z.number().int().positive().max(200).default(60)
})

interface SimpleTextProps {
  text: string
  color: string
  fontSize: number
  durationInFrames: number
}

export const SimpleText: React.FC<SimpleTextProps> = ({
  text,
  color,
  fontSize,
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
          transform: \`scale(${scale})\`,
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

SimpleText.defaultProps = {
  text: 'Hello World',
  color: '#ffffff',
  fontSize: 60
}

SimpleText.propsSchema = PropsSchema

export function registerExternalCompositions() {
  return [
    {
      id: 'SimpleText',
      component: SimpleText,
      defaultProps: SimpleText.defaultProps,
      propsSchema: PropsSchema,
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 90
    }
  ]
}
\`\`\`
