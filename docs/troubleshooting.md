# Troubleshooting Guide

This document covers common issues, their causes, and solutions.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Rendering Issues](#rendering-issues)
- [AI Intake Issues](#ai-intake-issues)
- [CLI Issues](#cli-issues)
- [TypeScript Issues](#typescript-issues)
- [3D Animation Issues](#3d-animation-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### Issue: "npm install fails with ENOENT"

**Cause**: Missing dependencies or incorrect workspace configuration.

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Workspace protocol not recognized"

**Cause**: Older npm version doesn't support workspaces.

**Solution**:

```bash
# Update npm
npm install -g npm@latest

# Or use Node.js 18+ which has npm 9+
node --version
```

### Issue: "Cannot find module '@remotion-mp4/core'"

**Cause**: Packages not built or linked.

**Solution**:

```bash
# Build all packages
npm run build

# Or build specific package
npm run build --workspace=packages/core
```

---

## Rendering Issues

### Issue: "Composition not found"

**Cause**: Composition ID doesn't match what's registered.

**Error Message**:

```
Error: No composition with ID 'MyAnimation' found.
```

**Solution**:

```bash
# List available compositions
npm run render -- --list

# Use correct ID
npm run render -- --comp CorrectId --out out.mp4
```

**Also check**:

1. Composition is properly exported
2. Registration function returns correct ID
3. Studio app imports the composition

### Issue: "WebGL not available"

**Cause**: Rendering 3D animation without WebGL mode.

**Error Message**:

```
Error: WebGL not available. Use --gl flag for 3D compositions.
```

**Solution**:

```bash
# Add WebGL mode flag
npm run render -- --comp RotatingCube --out out.mp4 --gl swangle
```

### Issue: "Render timeout"

**Cause**: Animation takes too long or has infinite loop.

**Error Message**:

```
Error: Render timed out after 300 seconds
```

**Solution**:

```bash
# Add max duration limit
npm run render -- --comp MyAnim --out out.mp4 --max-duration 30
```

**Also check**:

1. Animation has defined duration
2. No infinite loops in useFrame/useEffect
3. Compositions have valid durationInFrames

### Issue: "Memory exhausted"

**Cause**: Large composition or memory leak.

**Error Message**:

```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solution**:

```bash
# Reduce resolution
npm run render -- --comp MyAnim --out out.mp4 --width 1280 --height 720

# Clear cache first
rm -rf packages/renderer/.cache
```

**Also try**:

- Simplify the composition
- Reduce number of assets
- Restart the render process

### Issue: "Props validation failed"

**Cause**: Invalid props passed to composition.

**Error Message**:

```
Error: Props validation failed for 'MyAnimation':
- email must be a valid email
```

**Solution**:

```bash
# Use valid props
npm run render -- --comp MyAnim --out out.mp4 --props '{
  "email": "user@example.com"
}'
```

**Also check**:

- Props match the Zod schema
- Required props are provided
- Types are correct

---

## AI Intake Issues

### Issue: "Validation failed - Guardrail violation"

**Cause**: Code contains disallowed patterns.

**Error Message**:

```
Validation failed for: my-animation
- Guardrail violation: Math.random() found on line 5
- Guardrail violation: window used without guard on line 12
```

**Solution**:

1. Open the file in `input/my-animation/`
2. Fix the flagged issues:
   - Replace `Math.random()` with seeded random
   - Wrap `window`/`document` with `typeof` guards
3. Re-run validation:

```bash
npm run intake:validate -- --source my-animation
```

### Issue: "Required file missing"

**Cause**: Missing required files in input directory.

**Error Message**:

```
Validation failed for: my-animation
- Required file missing: src/Composition.tsx
- Required file missing: src/props.ts
- Required file missing: src/register.ts
```

**Solution**:

```bash
# Scaffold a template
npm run intake:new -- --name my-animation --kind 2d

# Check required structure
input/my-animation/
├── src/
│   ├── Composition.tsx
│   ├── props.ts
│   └── register.ts
└── README.md
```

### Issue: "Import fails - already exists"

**Cause**: Animation with same name already imported.

**Error Message**:

```
Import failed: Animation 'my-animation' already exists.
```

**Solution**:

```bash
# Use different name
npm run intake:import -- --source my-animation-v2

# Or remove existing
rm -rf packages/animations-external/my-animation
```

### Issue: "Composition not registered after import"

**Cause**: Registration didn't complete properly.

**Solution**:

```bash
# Re-run import
npm run intake:import -- --source my-animation --force

# Manually add to apps/studio/src/Root.tsx:
import { registerMyAnimation } from '@remotion-mp4/animations-external/my-animation'

// In Root.tsx registerCompositions():
...registerMyAnimation(),
```

---

## CLI Issues

### Issue: "Unknown option"

**Cause**: Typo or incorrect flag format.

**Error Message**:

```
error: unknown option '--outpt'
```

**Solution**:

```bash
# Check available options
npm run render -- --help

# Use correct flag
npm run render -- --out output.mp4  # not --outpt
```

### Issue: "Missing required argument"

**Cause**: Required CLI argument not provided.

**Error Message**:

```
error: missing required argument: 'out'
```

**Solution**:

```bash
# Provide required arguments
npm run render -- --comp MyAnim --out out.mp4
```

### Issue: "File path not found"

**Cause**: Output path doesn't exist or props file missing.

**Error Message**:

```
Error: Output path directory does not exist: out/
```

**Solution**:

```bash
# Create output directory
mkdir -p out

# Or provide full path
npm run render -- --comp MyAnim --out /full/path/out.mp4

# Check props file exists
npm run render -- --comp MyAnim --out out.mp4 --props props.json
```

---

## TypeScript Issues

### Issue: "Cannot find module"

**Cause**: Module not built or path incorrect.

**Error Message**:

```
Cannot find module '@remotion-mp4/core' or its corresponding type declarations.
```

**Solution**:

```bash
# Build the package
npm run build --workspace=packages/core

# Check tsconfig paths configuration
```

### Issue: "JSX not supported"

**Cause**: TypeScript not configured for JSX.

**Solution**:
Check `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### Issue: "Strict mode errors"

**Cause**: TypeScript strict mode catches more errors.

**Solution**:
Fix the type errors:

```typescript
// ❌ Problem
const value = data?.property || null

// ✅ Solution - explicit types
interface Data {
  property?: string
}
const value: string | null = data?.property ?? null
```

---

## 3D Animation Issues

### Issue: "Black screen in render"

**Cause**: Missing lights or camera position.

**Solution**:

```tsx
<Canvas>
  {/* Camera is required */}
  <perspectiveCamera position={[0, 0, 5]} />

  {/* Lights are required */}
  <ambientLight intensity={0.5} />
  <pointLight position={[10, 10, 10]} />

  {/* Your mesh */}
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</Canvas>
```

### Issue: "3D animation flickers"

**Cause**: Frame rate mismatch or memory issues.

**Solution**:

```bash
# Reduce FPS
npm run render -- --comp My3DAnim --out out.mp4 --fps 24

# Simplify scene
# Reduce geometry detail
# Use instanced meshes
```

### Issue: "WebGL context lost"

**Cause**: GPU memory exhausted.

**Solution**:

```bash
# Use software rendering
npm run render -- --comp My3DAnim --out out.mp4 --gl swiftshader

# Reduce texture sizes
# Simplify shaders
```

---

## Performance Issues

### Issue: "Slow rendering"

**Cause**: Complex composition or inefficient code.

**Solution**:

1. **Reduce FPS**:

```bash
npm run render -- --comp MyAnim --out out.mp4 --fps 24
```

2. **Reduce resolution**:

```bash
npm run render -- --comp MyAnim --out out.mp4 --width 1280 --height 720
```

3. **Simplify composition**:

- Use simpler geometry
- Reduce number of lights
- Remove expensive effects

### Issue: "High memory usage"

**Cause**: Memory leak or large assets.

**Solution**:

```bash
# Clear cache
rm -rf packages/renderer/.cache

# Restart render process

# Check for memory leaks in code:
useEffect(() => {
  const mesh = createMesh()
  return () => {
    mesh.geometry.dispose()
    mesh.material.dispose()
  }
}, [])
```

### Issue: "Slow type checking"

**Cause**: Large codebase or incorrect config.

**Solution**:

```bash
# Use incremental compilation
npm run typecheck -- --incremental

# Check tsconfig.json:
{
  "compilerOptions": {
    "skipLibCheck": true,
    "composite": true
  }
}
```

---

## Error Code Reference

| Error Code | Description             | Solution                           |
| ---------- | ----------------------- | ---------------------------------- |
| E001       | Composition not found   | Check composition ID with `--list` |
| E002       | WebGL not available     | Add `--gl swangle` flag            |
| E003       | Render timeout          | Add `--max-duration` or fix loops  |
| E004       | Props validation failed | Check JSON props syntax            |
| E005       | Guardrail violation     | Fix disallowed patterns            |
| E006       | File not found          | Check paths exist                  |
| E007       | Memory exhausted        | Reduce complexity or resolution    |
| E008       | Invalid codec           | Use h264, vp8, vp9, or prores      |
| E009       | Duration exceeds limit  | Increase `--max-duration`          |
| E010       | TypeScript error        | Fix type errors                    |

---

## Getting Help

If your issue isn't covered here:

1. **Check existing issues**: [GitHub Issues](https://github.com/your-org/Remotion_mp4/issues)
2. **Run with verbose output**:

```bash
npm run render -- --comp MyAnim --out out.mp4 --log verbose
```

3. **Collect diagnostics**:

```bash
# Node.js info
node --version
npm --version

# Project info
cat package.json | grep -E '"version"|"remotion"'
```

4. **Open an issue** with:
   - Error message
   - Command you ran
   - Expected vs actual behavior
   - Reproduction steps
