# @testing - Testing Agent

## Role
Implement comprehensive test suite for all modules and end-to-end rendering.

## Responsibilities
- Configure test framework (Vitest)
- Write unit tests for all modules
- Write integration tests for rendering pipeline
- Write e2e tests that render actual MP4s
- Set up test coverage reporting
- Document test strategy

## Test Framework Stack
- **Unit/Integration**: Vitest (fast, modern, native ESM)
- **Remotion Tests**: Remotion's built-in testing (frame assertions)
- **E2e**: Vitest with Node environment
- **Coverage**: c8 (native ES modules, faster than istanbul)

## Test Configuration
- `vitest.config.ts` - Root config
- Test environment: node (for E2e), jsdom (for React components)
- Coverage threshold: 80%
- Parallel execution enabled

## Test Categories

### Unit Tests
- **packages/core**: Type tests, logger tests, validator tests
- **packages/renderer**: Bundler (mocked), selector (mocked), renderer logic
- **packages/intake**: Scaffold tests, validator tests, guardrails tests
- **packages/assets**: Validation tests, resolver tests, preload tests
- **packages/animations-2d**: Component tests with useCurrentFrame() mocked
- **packages/animations-3d**: Component tests with useCurrentFrame() mocked

### Integration Tests
- Test render pipeline with simple composition
- Test bundle caching
- Test error handling and exit codes
- Test CLI argument parsing

### E2e Tests
- Render all built-in compositions (2D + 3D)
- Render external animation
- Validate outputs with ffprobe (if available)
- Check file exists, has correct extension, non-zero size
- Test max duration validation

## Test Structure
```
packages/
├── core/tests/
│   ├── types.test.ts
│   ├── logger.test.ts
│   └── validators.test.ts
├── renderer/tests/
│   ├── bundler.test.ts
│   ├── selector.test.ts
│   ├── renderer.test.ts
│   ├── cli.test.ts
│   └── integration.test.ts
├── animations-2d/tests/
│   ├── SimpleText.test.ts
│   └── Shapes.test.ts
├── animations-3d/tests/
│   └── RotatingCube.test.ts
├── intake/tests/
│   ├── scaffold.test.ts
│   ├── validator.test.ts
│   ├── guardrails.test.ts
│   └── importer.test.ts
└── assets/tests/
    ├── validators.test.ts
    ├── resolver.test.ts
    └── preload.test.ts

tests/e2e/
├── render-all-compositions.test.ts
└── validate-outputs.test.ts
```

## Example Test Patterns

### Unit Test (Vitest)
```typescript
import {describe, it, expect} from 'vitest'
import {renderToMp4} from '@remotion-mp4/renderer'

describe('renderer', () => {
  it('should throw error for invalid composition', async () => {
    await expect(
      renderToMp4({compositionId: 'Invalid', outputPath: 'out/test.mp4'})
    ).rejects.toThrow('Composition not found')
  })
})
```

### Remotion Composition Test
```typescript
import {Composition} from 'remotion'
import {renderFrame} from '@remotion/renderer'
import {SimpleText} from '../SimpleText'

describe('SimpleText', () => {
  it('should render frame 0', async () => {
    const {image} = await renderFrame({
      composition: {
        id: 'SimpleText',
        component: SimpleText,
        props: {text: 'Hello', color: '#ff0000'},
        durationInFrames: 90,
        fps: 30,
        width: 1920,
        height: 1080
      },
      frame: 0
    })
    expect(image).toBeDefined()
  })
})
```

### E2e Test
```typescript
import {describe, it, expect} from 'vitest'
import {renderToMp4} from '@remotion-mp4/renderer'
import {existsSync, statSync} from 'fs'

describe('E2e: Render All Compositions', () => {
  it('renders SimpleText composition', async () => {
    const result = await renderToMp4({
      compositionId: 'SimpleText',
      outputPath: 'out/test-simple-text.mp4',
      inputProps: {text: 'Hello', color: '#ff0000', fontSize: 60}
    })

    expect(result.success).toBe(true)
    expect(existsSync(result.outputPath!)).toBe(true)
    expect(statSync(result.outputPath!).size).toBeGreaterThan(0)
  })

  it('enforces max duration', async () => {
    await expect(
      renderToMp4({
        compositionId: 'SimpleText',
        outputPath: 'out/test-max-duration.mp4',
        maxDurationSeconds: 1 // Only 1 second allowed
      })
    ).rejects.toThrow('exceeds max duration')
  })
})
```

## Coverage Goals
- Overall: > 80%
- packages/core: > 90%
- packages/renderer: > 85%
- packages/intake: > 85%
- packages/assets: > 90%
- packages/animations-2d: > 75% (animations are hard to test)
- packages/animations-3d: > 75%

## Deliverables
- `vitest.config.ts` - Test configuration
- `vitest.workspace.ts` - Workspace config
- All `*/tests/` directories with comprehensive tests
- `tests/e2e/` directory
- Coverage reports
- `docs/testing.md` - Test strategy documentation

## Workflow
1. Configure Vitest
2. Write unit tests for each module (coordinate with subagents)
3. Write integration tests for rendering
4. Write e2e tests
5. Set up coverage reporting
6. Ensure all tests pass
7. Document test strategy

## Success Criteria
- `npm test` passes
- Coverage > 80% overall
- Unit tests for all modules
- Integration tests for rendering pipeline
- E2e tests produce valid MP4s
- Test strategy documented

## Dependencies
- vitest
- @vitest/ui
- c8 (coverage)
- @remotion/testing-utils
