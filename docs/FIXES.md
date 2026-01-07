# Project Fixes Required

This document outlines all issues preventing the project from building and rendering animations.

## Summary

The project has several structural and dependency issues that need to be fixed:

1. **TypeScript Configuration** - Missing JSX configuration
2. **Missing Dependencies** - `three`, `@types/yargs`
3. **React Version Conflict** - React 18 vs React 19 peer deps
4. **Component Issues** - Missing `propsSchema` static property
5. **Package Build Order** - Circular dependencies between packages
6. **API Compatibility** - Remotion API changes between versions

---

## Issue 1: TypeScript Configuration

**File:** `tsconfig.json`

**Problem:** Missing `jsx` configuration, causing JSX syntax errors.

**Fix:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "node",
    "jsx": "react-jsx", // ADD THIS
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

**Status:** ✅ Fixed in current session

---

## Issue 2: Missing Dependencies

### animations-3d package

**File:** `packages/animations-3d/package.json`

**Problem:** Missing `three` dependency required by @remotion/three.

**Fix:** Add to dependencies:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "remotion": "^4.0.138",
    "@remotion/three": "^4.0.138",
    "three": "^0.160.0" // ADD THIS
  }
}
```

### renderer package

**File:** `packages/renderer/package.json`

**Problem:** Missing `@types/yargs` for CLI types.

**Fix:** Add to devDependencies:

```json
{
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/yargs": "^17.0.32", // ADD THIS
    "typescript": "^5.3.3"
  }
}
```

---

## Issue 3: React Version Conflict

**Problem:** @react-three/fiber@9.x requires React 19, but the project uses React 18.

**Root Cause:**

```
peer @react-three/fiber@">=8.0.0" from @remotion/three@4.0.402
peer react@">=19 <19.3" from @react-three/fiber@9.5.0
```

**Options:**

### Option A: Downgrade @react-three/fiber (Recommended)

Edit `packages/animations-3d/package.json`:

```json
{
  "dependencies": {
    "@remotion/three": "^4.0.138",
    "@react-three/fiber": "^8.15.0", // Force version 8
    "three": "^0.160.0"
  }
}
```

Then reinstall:

```bash
rm -rf packages/animations-3d/node_modules packages/animations-3d/package-lock.json
cd packages/animations-3d && npm install
```

### Option B: Upgrade to React 19

Edit root `package.json`:

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

Then reinstall all packages.

---

## Issue 4: Missing propsSchema on Components

**Files:**

- `packages/animations-2d/src/compositions/SimpleText.tsx`
- `packages/animations-2d/src/compositions/Shapes.tsx`
- `packages/animations-3d/src/compositions/RotatingCube.tsx`

**Problem:** Components don't have `propsSchema` static property, causing type errors.

**Fix for SimpleText.tsx:**

```typescript
import { z } from 'zod'

// ... existing code ...

export const SimpleText: React.FC<SimpleTextProps> = ({ text, color, fontSize }) => {
  // ... existing code ...
}

SimpleText.defaultProps = {
  text: 'Hello World',
  color: '#000000',
  fontSize: 72,
}

// ADD THIS:
SimpleText.propsSchema = z.object({
  text: z.string().default('Hello World'),
  color: z.string().default('#000000'),
  fontSize: z.number().default(72),
})
```

**Fix for Shapes.tsx:**

```typescript
// ADD after defaultProps:
Shapes.propsSchema = z.object({
  durationInFrames: z.number().default(120),
})
```

**Fix for RotatingCube.tsx:**

```typescript
// ADD after defaultProps:
RotatingCube.propsSchema = z.object({
  durationInFrames: z.number().default(180),
})
```

---

## Issue 5: Package Build Order (Circular Dependencies)

**Problem:** Packages depend on each other in a way that prevents sequential building.

**Dependency Chain:**

```
core → assets, intake, renderer
animations-2d → needs built core
animations-3d → needs built core + three
studio → needs all packages built
```

**Fix:**

1. Build packages in correct order:

```bash
npm run build --workspace=@remotion-mp4/core
npm run build --workspace=@remotion-mp4/assets
npm run build --workspace=@remotion-mp4/intake
npm run build --workspace=@remotion-mp4/renderer
npm run build --workspace=@remotion-mp4/animations-2d
npm run build --workspace=@remotion-mp4/animations-3d
npm run build --workspace=@remotion-mp4/external-demoanimation
npm run build --workspace=@remotion-mp4/studio
```

2. Or update `package.json` root scripts to build in correct order:

```json
{
  "scripts": {
    "build:core": "npm run build --workspace=@remotion-mp4/core",
    "build:assets": "npm run build --workspace=@remotion-mp4/assets",
    "build:intake": "npm run build --workspace=@remotion-mp4/intake",
    "build:renderer": "npm run build --workspace=@remotion-mp4/renderer",
    "build:2d": "npm run build --workspace=@remotion-mp4/animations-2d",
    "build:3d": "npm run build --workspace=@remotion-mp4/animations-3d",
    "build:external": "npm run build --workspace=@remotion-mp4/external-demoanimation",
    "build:studio": "npm run build --workspace=@remotion-mp4/studio",
    "build": "npm run build:core && npm run build:assets && npm run build:intake && npm run build:renderer && npm run build:2d && npm run build:3d && npm run build:external && npm run build:studio"
  }
}
```

---

## Issue 6: API Compatibility Issues

### renderer/src/renderer.ts

**File:** `packages/renderer/src/renderer.ts`

**Problem:** `onProgress` callback signature doesn't match Remotion's expected type.

**Fix:**

```typescript
// Current (line ~71):
const onProgress = (progress: {
  renderedFrames: number;
  encodedFrames: number;
  renderedDurationInMilliseconds: number;
  encodedDurationInMilliseconds: number;
  stitchStage: "encoding" | "stitching" | "muxing";
}) => { ... }

// Should be:
const onProgress = (progress: {
  renderedFrames: number;
  encodedFrames: number;
  encodedDoneIn: number | null;
  renderedDoneIn: number | null;
  renderEstimatedTime: number;
  progress: number;
  stitchStage: StitchingState;
}) => { ... }
```

### renderer/src/selector.ts

**File:** `packages/renderer/src/selector.ts`

**Problem:** `selectComposition` API has changed in newer Remotion versions.

**Fix:**

```typescript
// Current (line ~26):
const result = await selectComposition({
  compositionId,
  bundlingServer,
  fullPathToBrowserBundle,
})

// May need to use different API or cast types
```

### apps/studio/remotion.config.ts

**File:** `apps/studio/remotion.config.ts`

**Problem:** `Config` is no longer exported from `@remotion/cli`.

**Fix:**

```typescript
// Current:
import { Config } from '@remotion/cli'
Config.setQuality(80)

// Check Remotion 4.x documentation for new config API
// or use default quality
```

---

## Issue 7: Bin Files TypeScript Syntax

**Files:**

- `packages/intake/bin/validate.js`
- `packages/intake/bin/import.js`

**Problem:** Files contain TypeScript `as` type assertions that fail in Node.js.

**Status:** ✅ Fixed in current session (removed `as any` type assertions)

---

## Issue 8: Missing Studio tsconfig.json

**File:** `apps/studio/tsconfig.json`

**Problem:** Missing tsconfig.json causes Remotion Studio to fail.

**Fix:** ✅ Created in current session with jsx configuration.

---

## Recommended Fix Order

1. **Fix tsconfig.json** - Add jsx configuration (✅ Done)
2. **Fix React version** - Downgrade @react-three/fiber or upgrade React
3. **Install missing deps** - `three`, `@types/yargs`
4. **Fix component propsSchema** - Add static property to all components
5. **Build packages** - In correct order: core → assets → intake → renderer → animations-2d → animations-3d → external → studio
6. **Fix API compatibility** - Update renderer.ts and selector.ts for Remotion 4.x API

---

## Quick Test Commands

After fixes, run these commands:

```bash
# Validate input
npm run intake:validate

# Import animation
npm run intake:import -- --source DemoAnimation

# Start studio
npm run dev  # or: cd apps/studio && npm start

# Render to MP4
npm run render -- --comp DemoAnimation --out out/demo.mp4
```

---

## Imported Animations

### DemoAnimation

**Location:** `packages/animations-external/DemoAnimation/`

**Props:**
| Prop | Type | Default |
|------|------|---------|
| text | string | "Hello World" |
| color | string | "#3498db" |
| fontSize | number | 72 |
| durationInFrames | number | 90 |

**Animation:** Fade-in, scale, and slide-up text animation over dark background.

---

## Notes

- The `input/` directory is gitignored - only use for code you want to import
- After import, code lives permanently in `packages/animations-external/`
- Run `npm install` after any package.json changes
- Use `--legacy-peer-deps` if encountering peer dependency warnings
