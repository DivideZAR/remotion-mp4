# ADR-003: SSR Rendering Strategy

## Status
Accepted

## Context
Remotion supports multiple rendering approaches:

1. **CLI Rendering**: Use `npx remotion render` command
2. **SSR APIs**: Use `@remotion/renderer` Node.js APIs
3. **Studio Preview**: Remotion Studio web interface

For a programmatic, modular system, we need:
- Node.js rendering (no browser required)
- Batch processing capability
- Performance optimization
- WebGL support for 3D compositions

## Decision
Use **Remotion SSR APIs** (`@remotion/renderer`) as the primary rendering method.

### Rendering Pipeline

```
1. bundleComposition()      -> Create webpack bundle (cached)
2. selectComposition()       -> Validate composition exists
3. renderToMp4()           -> Render to MP4 using @remotion/renderer
```

### Bundle Caching

**Critical**: Don't rebundle for every render!

**Strategy**:
- Cache key: `compositionId + inputProps hash + source file hash`
- Cache location: `.cache/bundles/`
- Invalidate: Source files change
- Reuse: Same composition + same props

```typescript
const cacheKey = `${compositionId}-${hash(inputProps)}-${hash(sourceFiles)}`
const cachePath = `.cache/bundles/${cacheKey}.js`

if (exists(cachePath)) {
  return cachePath  // Reuse cached bundle
}

const bundle = await bundleComposition(...)
await saveToCache(cachePath, bundle)
return bundle
```

### Chromium Options

**WebGL Support**:
- Default: `angle` (macOS/Windows), `swangle` (Linux/CI)
- Configurable via `--gl` flag
- Critical for 3D compositions (`@remotion/three`)

**Common Issues**:
- WebGL not available: Use `--gl swangle`
- Headless rendering: Pass `headless: true`
- Memory limits: Adjust `concurrency`

### Max Duration Validation

**Problem**: Long videos can:
- Take too long to render
- Exceed memory limits
- Timeout unexpectedly

**Solution**: Validate before rendering:

```typescript
const durationSeconds = composition.durationInFrames / composition.fps

if (maxDurationSeconds && durationSeconds > maxDurationSeconds) {
  throw new Error(
    `Duration (${durationSeconds}s) exceeds max (${maxDurationSeconds}s)`
  )
}
```

### Error Handling

**Exit Codes**:
- `0`: Success
- `1`: Render error (timeout, chromium crash, etc.)
- `2`: Validation error (invalid composition, props, etc.)

**Error Messages**: Clear, actionable, with context

## Advantages

1. **Programmatic**: Can be automated and batch-processed
2. **Fast**: Bundle caching prevents redundant builds
3. **Flexible**: Supports 2D and 3D
4. **WebGL**: Full support via chromium options
5. **Node.js**: No browser required

## Consequences

### Positive
- Fast rendering with caching
- Supports batch processing
- WebGL works on CI
- Clear error handling

### Negative
- More complex than CLI rendering
- Must manage bundle cache
- Chromium can be resource-heavy

## Alternatives Considered

1. **CLI Rendering Only**: Not programmatic, slow for batch processing
2. **Browser Rendering**: Requires browser, not suitable for CI
3. **Puppeteer + FFmpeg**: Reinventing Remotion, missing optimizations

## Related Decisions

- ADR-001: Monorepo Structure
- ADR-002: External Composition Contract
