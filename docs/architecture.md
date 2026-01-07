# Architecture Documentation

This document describes the high-level architecture of the Remotion MP4 renderer, including module boundaries, data flows, and key design decisions.

## Overview

The Remotion MP4 renderer is a modular monorepo designed for:

1. **Rendering 2D/3D animations** to MP4 using Remotion's SSR capabilities
2. **Supporting AI-generated code** through a safe intake pipeline
3. **Providing a studio interface** for development and preview

## Project Structure

```
Remotion_mp4/
├── apps/
│   └── studio/              # Development UI for previewing animations
├── packages/
│   ├── core/                # Shared types, utilities, and contracts
│   ├── renderer/            # SSR rendering engine + CLI
│   ├── intake/              # AI code validation and import
│   ├── assets/              # Asset management and validation
│   ├── animations-2d/       # Built-in 2D compositions
│   └── animations-3d/       # Built-in 3D compositions
├── docs/                    # Documentation
├── prompts/                 # AI code generation prompts
└── input/                   # Input directory for AI-generated code
```

## Module Architecture

### Core Package (`packages/core/`)

The foundation of all other packages. Provides:

- **Types**: Interfaces for compositions, render options, assets
- **Validation**: Zod schemas for runtime validation
- **Utilities**: Logger, helpers, type guards

```
packages/core/src/
├── types/
│   ├── composition.ts       # ExternalComposition, CompositionMetadata
│   ├── render.ts            # RenderOptions, WebGLMode, VideoCodec
│   └── asset.ts             # Asset, AssetType, validation schemas
└── utils/
    ├── validators.ts        # isValidX, validateX functions
    └── logger.ts            # Structured logging
```

### Renderer Package (`packages/renderer/`)

The core rendering engine. Handles:

- **Bundling**: Uses `@remotion/bundler` to create browser bundles
- **Composition Selection**: Finds and validates compositions
- **SSR Rendering**: Renders to MP4 using headless Chromium

```
packages/renderer/src/
├── bundler.ts               # bundleComposition()
├── selector.ts              # selectCompositionWrapper(), listCompositions()
├── renderer.ts              # renderToMp4(), renderCompositions()
└── cli.ts                   # CLI entry point
```

**Key Functions**:

| Function                     | Purpose                             |
| ---------------------------- | ----------------------------------- |
| `bundleComposition()`        | Creates a browser-compatible bundle |
| `selectCompositionWrapper()` | Finds composition by ID             |
| `listCompositions()`         | Lists all available compositions    |
| `renderToMp4()`              | Renders composition to MP4 file     |
| `validateRenderOptions()`    | Validates CLI options               |

### Intake Package (`packages/intake/`)

Handles safe import of AI-generated or external code.

```
packages/intake/src/
├── guardrails.ts            # Security validation patterns
├── validator.ts             # TypeScript, ESLint, guardrail checks
├── scaffold.ts              # Template-based scaffolding
├── importer.ts              # Copy and registration logic
└── index.ts                 # Public API
```

**Pipeline**:

```
input/<name>/
    ↓ validate
    ├─ TypeScript compilation
    ├─ ESLint validation
    └─ Guardrail checks (Math.random, fetch, window, eval, fs)
    ↓ import
packages/animations-external/<name>/
    ↓ register
apps/studio/src/Root.tsx
```

### Assets Package (`packages/assets/`)

Manages assets (images, videos, audio) used in compositions.

```
packages/assets/src/
├── validators.ts            # Asset validation
├── resolver.ts              # Path resolution
├── cache.ts                 # Asset caching
└── preload.ts               # Preloading utilities
```

### Animations Packages (`packages/animations-2d/`, `packages/animations-3d/`)

Built-in composition examples demonstrating 2D and 3D animations.

```
packages/animations-2d/src/
├── compositions/
│   ├── SimpleText/          # Text animation
│   └── ...                  # More 2D compositions
└── index.ts                 # Exports all compositions
```

### Studio App (`apps/studio/`)

Development UI built with Remotion Studio.

```
apps/studio/src/
├── Root.tsx                 # Composition registration
└── index.tsx                # App entry
```

## Data Flow

### Rendering Flow

```
1. CLI Parse
   └─ parse --comp, --out, --props, --gl, --codec, --max-duration

2. Bundle
   └─ bundleComposition(compId, bundlePath)

3. Select
   └─ selectCompositionWrapper(bundlePath, compId)
   └─ get composition metadata (dimensions, fps, duration)

4. Validate
   └─ Check max-duration vs composition duration
   └─ Validate props if provided

5. Render
   └─ renderToMp4(composition, outputPath, options)
   └─ Headless Chromium renders frames
   └─ Encode to MP4 with specified codec

6. Output
   └─ Save to --out path
   └─ Return RenderResult with metadata
```

### AI Intake Flow

```
1. Placement
   └─ User places code in input/<name>/

2. Validation
   └─ intake:validate runs:
      ├─ tsc --noEmit (TypeScript)
      ├─ eslint (code quality)
      └─ guardrails (security)

3. Scaffolding (optional)
   └─ intake:new creates template:
      ├─ Composition.tsx
      ├─ props.ts (Zod schema)
      └─ register.ts (registration function)

4. Import
   └─ intake:import copies to packages/animations-external/
   └─ Creates package.json
   └─ Registers in Root.tsx

5. Render
   └─ Available as any built-in composition
```

## Type Contracts

### External Composition Contract

All external animations must implement:

```typescript
import { z } from 'zod'
import React from 'react'

// 1. Props Schema (required)
export const PropsSchema = z.object({
  text: z.string().default('Hello'),
  color: z.string().default('#000000')
})

type Props = z.infer<typeof PropsSchema>

// 2. Component (required)
export const MyAnimation: React.FC<Props> = ({text, color}) => {
  return <div style={{color}}>{text}</div>
}

// 3. Default Props (required for preview)
MyAnimation.defaultProps = {
  text: 'Hello',
  color: '#000000'
}

// 4. Registration Function (required)
export function registerExternalCompositions() {
  return [{
    id: 'MyAnimation',
    component: MyAnimation,
    defaultProps: MyAnimation.defaultProps,
    propsSchema: PropsSchema,
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 90
  }]
}
```

### Render Options Contract

```typescript
interface RenderOptions {
  // Required
  compositionId: string
  outputPath: string

  // Optional with defaults
  codec?: VideoCodec // default: 'h264'
  gl?: WebGLMode // default: 'angle'
  maxDuration?: number // default: 60 seconds
  props?: Record<string, unknown>

  // Advanced
  chromiumOptions?: {
    disableWebSecurity?: boolean
    headless?: boolean
  }
}
```

## Dependency Graph

```
studio (app)
    ↓ imports
animations-2d, animations-3d (packages)
    ↓ imports
renderer (package)
    ├─ imports → core (types)
    ├─ imports → remotion/* (bundler, renderer)
    └─ imports → animations-* (compositions)

intake (package)
    ├─ imports → core (validation)
    └─ imports → renderer (registration)

assets (package)
    └─ imports → core (types)
```

## Key Design Decisions

### 1. Monorepo Structure

Chosen for:

- Easy cross-package development
- Shared types via `core` package
- Consistent tooling across packages
- Atomic updates for related changes

### 2. Workspace Protocol

Using npm workspaces (`workspace:*` protocol):

- Automatic linking of local packages
- No publish step during development
- Version consistency enforced

### 3. Guardrails in Intake

Security measures for AI-generated code:

- **No Math.random()**: Ensures deterministic output
- **No fetch without async**: Prevents SSR hangs
- **No window/document without guard**: SSR compatibility
- **No eval/Function()**: Security risk prevention
- **No fs operations**: SSR/browser safety

### 4. Zod for Runtime Validation

Used for:

- Props validation from CLI
- Configuration validation
- User input sanitization
- Type-safe configuration files

## Future Architecture Considerations

1. **Plugin System**: Allow third-party render pipelines
2. **Cloud Rendering**: Add remote rendering support
3. **Composition Templates**: Reusable composition patterns
4. **Asset CDN**: External asset hosting
5. **Multi-project**: Support multiple render projects
