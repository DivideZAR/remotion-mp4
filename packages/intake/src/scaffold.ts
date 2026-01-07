import { mkdir, writeFile, stat, readFile } from 'fs/promises'
import { join } from 'path'
import { logger } from '@remotion-mp4/core'

export interface ScaffoldOptions {
  name: string
  kind: '2d' | '3d'
  outDir?: string
}

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { name, kind, outDir = 'packages/animations-external' } = options

  logger.info(`Scaffolding new ${kind} composition: ${name}`)

  const packageDir = join(outDir, name)

  try {
    await stat(packageDir)
    logger.warn(`Directory ${packageDir} already exists, skipping...`)
    return
  } catch {
    await mkdir(packageDir, { recursive: true })
  }

  const srcDir = join(packageDir, 'src')

  try {
    await stat(srcDir)
    logger.warn(`Source directory ${srcDir} already exists, skipping...`)
    return
  } catch {
    await mkdir(srcDir, { recursive: true })
  }

  const kindMap = {
    '2d': 'composition-2d',
    '3d': 'composition-3d',
  }

  const compositionFile = kind === '3d' ? 'composition-3d.tsx' : 'composition-2d.tsx'

  await writeFile(join(srcDir, 'Composition.tsx'), getCompositionTemplate(name, kind))

  await writeFile(join(srcDir, 'props.ts'), getPropsTemplate(name))

  await writeFile(join(srcDir, 'register.ts'), getRegisterTemplate(name))

  await writeFile(join(packageDir, 'package.json'), getPackageJsonTemplate(name, kind))

  await writeFile(join(packageDir, 'README.md'), getReadmeTemplate(name, kind))

  logger.info(`Scaffolding complete: ${packageDir}`)
  logger.info(`Next steps:`)
  logger.info(`  1. Edit ${join(srcDir, 'Composition.tsx')}`)
  logger.info(`  2. Validate: npm run intake:validate`)
  logger.info(`  3. Import: npm run intake:import -- --source ${name}`)
}

function getCompositionTemplate(name: string, kind: string): string {
  const is3d = kind === '3d'

  return `import React from 'react'
import {useCurrentFrame, interpolate} from 'remotion'
${is3d ? "import * as THREE from 'three'\nimport {Canvas} from '@remotion/three'\n" : ''}
import {PropsSchema} from './props'

interface ${capitalize(name)}Props {
  ${is3d ? '  color: string\n  rotationSpeed: number' : '  text: string\n  color: string\n  fontSize: number'}
  durationInFrames: number
}

export const ${capitalize(name)}: React.FC<${capitalize(name)}Props> = (${
    is3d ? 'color, rotationSpeed' : 'text, color, fontSize'
  }, durationInFrames) => {
  const frame = useCurrentFrame()

${
  is3d
    ? `  const rotationX = interpolate(frame, [0, durationInFrames], [0, Math.PI * 2 * rotationSpeed])
  const rotationY = interpolate(frame, [0, durationInFrames], [0, Math.PI * 4 * rotationSpeed])
  const scale = interpolate(frame, [0, 60, durationInFrames - 60, durationInFrames], [0.5, 1, 1, 0.5])

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
  )`
    : `  const opacity = interpolate(frame, [0, 30, 60, 90], [0, 1, 1, 0])
  const scale = interpolate(frame, [0, 45], [0.5, 1])
  const yOffset = interpolate(frame, [0, 90], [-50, 50])

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
          fontSize: \`\${fontSize}px\`,
          color,
          opacity,
          transform: \`translateY(\${yOffset}px)\`,
          textShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
          fontWeight: 'bold',
          textAlign: 'center'
        }}
      >
        {text}
      </div>
    </div>
  )`
}

${capitalize(name)}.defaultProps = ${is3d ? "{\n  color: '#00ff00',\n  rotationSpeed: 1\n}" : "{\n  text: 'Hello World',\n  color: '#ffffff',\n  fontSize: 60\n}"}

${capitalize(name)}.propsSchema = PropsSchema
`
}

function getPropsTemplate(name: string): string {
  return `import {z} from 'zod'

export const PropsSchema = z.object({
  text: z.string().default('Hello World'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#ffffff'),
  fontSize: z.number().int().positive().max(200).default(60)
})
`
}

function getRegisterTemplate(name: string): string {
  const camelName = capitalize(name)

  return `import {ExternalComposition} from '@remotion-mp4/core'
import {${camelName}} from './Composition'

export function registerExternalCompositions() {
  return [
    {
      id: '${name}',
      component: ${camelName},
      defaultProps: ${camelName}.defaultProps,
      propsSchema: ${camelName}.propsSchema,
      width: 1920,
      height: 1080,
      fps: 30,
      durationInFrames: 90
    }
  ]
}
`
}

function getPackageJsonTemplate(name: string, kind: string): string {
  const is3d = kind === '3d'

  return `{
  "name": "@remotion-mp4/external-${name.toLowerCase()}",
  "version": "1.0.0",
  "description": "${is3d ? '3D' : '2D'} animation: ${name}",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    ${is3d ? '@remotion/three: "^4.0.138",\n    "three": "^0.160.0",' : ''}
    "remotion": "^4.0.138",
    "@remotion-mp4/core": "workspace:*",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "typescript": "^5.3.3"
  }
}
`
}

function getReadmeTemplate(name: string, kind: string): string {
  const is3d = kind === '3d'

  const usageProps = is3d
    ? 'color":"#ff0000","rotationSpeed":2'
    : 'text":"Custom","color":"#ff0000","fontSize":80'

  const propsList = is3d
    ? '- `color` (hex): Box color (default: #00ff00)\n  - `rotationSpeed` (number): Rotation speed 1-3 (default: 1)'
    : '- `text` (string): Text to display (default: "Hello World")\n  - `color` (hex): Text color (default: #ffffff)\n  - `fontSize` (number): Font size 1-200 (default: 60)'

  const renderingSection = is3d
    ? `### WebGL Context
- **Local dev**: \`--gl angle\` (macOS/Windows)
- **CI/Linux**: \`--gl swangle\` (recommended)
- **Fallback**: \`--gl swiftshader\` (slowest)
- **Critical**: Always specify \`--gl\` flag for 3D renders`
    : `### Notes
- Uses absolute positioning
- Smooth animations with \`interpolate()\`
- Props validated with Zod schema
- Follows external composition contract`

  return `# ${name}

${is3d ? 'A 3D animation using @remotion/three.' : 'A 2D animation using Remotion primitives.'}

## Usage

\`\`\`bash
# Render with default props
npm run render -- --comp ${name} --out out/${name.toLowerCase()}.mp4

# Render with WebGL for 3D
npm run render -- --comp ${name} --out out/${name.toLowerCase()}.mp4 --gl swangle

# Render with custom props
echo '{ "${usageProps}" }' > props.json
npm run render -- --comp ${name} --out out/${name.toLowerCase()}.mp4 --props props.json
\`\`\`

## Props

${propsList}

## Technical Details

- Resolution: 1920x1080
- FPS: 30
- Duration: 90 frames (3 seconds)
- Frame range: 0-89

## Rendering

${renderingSection}

## Development

\`\`\`bash
# Validate
npm run intake:validate -- --source ${name}

# Import
npm run intake:import -- --source ${name}

# Preview in Studio
npm run dev
\`\`\`

## Author

  AI-generated or manually created.
`
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
