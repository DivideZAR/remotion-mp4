# AGENTS.md

This file contains guidelines for agentic coding assistants working on this Remotion project.

## Build, Lint, and Test Commands

### Installation
```bash
npm install
```

### Development
```bash
npm start
```

### Building
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run typecheck
```

### Testing
```bash
npm test
```

### Running a Single Test
```bash
npm test -- MyTestFile.test.ts
npm test -- -t "test description"
```

## Code Style Guidelines

### Imports
- Use ES6 imports: `import React from 'react'`
- Group imports in order: React, third-party, internal, types
- Use absolute imports for Remotion components: `import {Composition} from 'remotion'`
- Use named exports by default, default exports only for components

### File Naming
- Components: PascalCase (e.g., `MyVideo.tsx`)
- Utilities: camelCase (e.g., `formatTime.ts`)
- Types: PascalCase with `.types.ts` suffix (e.g., `VideoConfig.types.ts`)
- Hooks: camelCase with `use` prefix (e.g., `useVideoDuration.ts`)

### Component Structure
```tsx
import React from 'react'

interface MyComponentProps {
  propOne: string
  propTwo?: number
}

export const MyComponent: React.FC<MyComponentProps> = ({propOne, propTwo}) => {
  return (
    <div>
      {/* JSX content */}
    </div>
  )
}
```

### Remotion Specifics
- Always define frame range in Composition
- Use fps constant from Remotion config
- Prefer `useCurrentFrame()` hook for animation logic
- Use `useVideoMetadata()` for dimension/length access
- Keep compositions under 2 minutes for optimal performance
- Use absolute positioning with `position: 'absolute'`

### TypeScript
- Strict mode enabled - all props must be typed
- Use `interface` for object shapes, `type` for unions/intersections
- Avoid `any` - use `unknown` or proper types
- Use type assertions sparingly: `as Type`

### Error Handling
- Wrap async operations in try-catch
- Use error boundaries for composition errors
- Log errors with context: `console.error('Failed to load video:', error)`
- Return fallback UI when data is unavailable

### Formatting
- Use Prettier with default config
- 2 space indentation
- Single quotes for strings
- Trailing commas in multi-line structures
- No semicolons (or consistent with project)

### Performance
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to child components
- Avoid inline functions in render props
- Use `interpolate()` for smooth animations
- Preload assets before composition start

### Video Assets
- Store assets in `public/` directory
- Use relative paths from public root
- Optimize images: prefer WebP format
- Use appropriate resolution (1080p or 4k)
- Consider using audio sprites for multiple sounds

### Testing
- Test components with Remotion's testing utilities
- Use `expectFrame()` for frame-based assertions
- Mock `useCurrentFrame()` in tests
- Test animation keyframes at critical points
- Validate composition metadata

### Git Workflow
- Create feature branches from main
- Write descriptive commit messages
- Run lint and typecheck before committing
- Keep PRs focused and small
- Update AGENTS.md if conventions change
