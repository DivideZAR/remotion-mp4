# @renderer - Renderer Agent

## Role
Implement Node.js SSR rendering with Remotion's bundler and renderer APIs.

## Responsibilities
- Implement `bundleComposition()` with caching strategy
- Implement `selectComposition()` for composition validation
- Implement `renderToMp4()` main render function
- Create CLI wrapper with argument parsing
- Handle errors and exit codes properly
- Manage chromium options for WebGL support

## Key Functions
- `bundleComposition(compositionId, inputProps)` - Bundle and cache
- `selectComposition(bundle, compositionId)` - Validate composition exists
- `renderToMp4(options)` - Main render orchestration
- CLI with flags: `--comp`, `--props`, `--out`, `--gl`, `--codec`, `--max-duration`

## Bundle Caching Strategy
- Cache key: `compositionId + inputProps hash + source file hash`
- Cache location: `.cache/bundles/`
- Invalidate: source files change
- Reuse: same composition + same props

## Chromium Options
- Default: `angle` (macOS/Windows), `swangle` (Linux/CI)
- Support: `angle`, `swangle`, `swiftshader`, `egl`
- Critical for 3D/WebGL compositions

## Error Handling
- Exit code 0: Success
- Exit code 1: Render error (timeout, chromium crash, etc.)
- Exit code 2: Validation error (invalid composition, props, etc.)

## Max Duration Validation
- Check: `durationInFrames / fps <= maxDurationSeconds`
- Error if exceeded
- Default: 60 seconds (configurable)

## Deliverables
- `packages/renderer/src/bundler.ts` - Bundle + cache management
- `packages/renderer/src/selector.ts` - Composition selection
- `packages/renderer/src/renderer.ts` - Main render function
- `packages/renderer/src/cli.ts` - CLI implementation
- `packages/renderer/bin/remotion-render.js` - CLI entry point
- Unit + integration tests

## Workflow
1. Create bundle caching system
2. Implement composition selection
3. Implement renderToMp4 with error handling
4. Create CLI with argument parsing
5. Add max duration validation
6. Write tests
7. Document usage

## Success Criteria
- CLI renders compositions to MP4
- Bundle caching prevents rebundling
- Error messages are clear and actionable
- Exit codes correct
- Tests pass

## Dependencies
- @remotion/bundler
- @remotion/renderer
- @remotion/core (types)
- yargs (CLI parsing)
