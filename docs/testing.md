# Testing Documentation

This document outlines the testing strategy, test setup, and best practices for the Remotion MP4 renderer.

## Test Framework

The project uses **Vitest** for all testing:

```json
{
  "devDependencies": {
    "vitest": "^1.2.1",
    "@vitest/ui": "^1.2.1"
  }
}
```

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- utils.test.ts

# Run tests matching pattern
npm test -- -t "validate"

# Run tests in watch mode
npm test -- --watch
```

### Package-specific Tests

```bash
# Test core package
npm test --workspace=packages/core

# Test renderer package
npm test --workspace=packages/renderer

# Test intake package
npm test --workspace=packages/intake

# Test assets package
npm test --workspace=packages/assets
```

## Test Structure

```
packages/core/
├── src/
│   ├── utils/
│   │   ├── validators.ts
│   │   └── logger.ts
│   └── types/
│       ├── composition.ts
│       ├── render.ts
│       └── asset.ts
└── tests/
    ├── validators.test.ts
    ├── logger.test.ts
    ├── types.test.ts
    └── setup.ts
```

## Test Types

### 1. Unit Tests

Test individual functions and utilities.

```typescript
// packages/core/tests/validators.test.ts
import { describe, it, expect } from 'vitest'
import {
  isValidCompositionId,
  validateCompositionId,
  isPositiveInteger,
  validateFPS,
} from '../src/utils/validators'

describe('validators', () => {
  describe('isValidCompositionId', () => {
    it('should return true for valid IDs', () => {
      expect(isValidCompositionId('SimpleText')).toBe(true)
      expect(isValidCompositionId('RotatingCube')).toBe(true)
      expect(isValidCompositionId('MyAnimation123')).toBe(true)
    })

    it('should return false for invalid IDs', () => {
      expect(isValidCompositionId('')).toBe(false)
      expect(isValidCompositionId('has spaces')).toBe(false)
      expect(isValidCompositionId('special!@#')).toBe(false)
    })
  })

  describe('validateFPS', () => {
    it('should accept valid FPS values', () => {
      expect(validateFPS(24)).toBe(true)
      expect(validateFPS(30)).toBe(true)
      expect(validateFPS(60)).toBe(true)
    })

    it('should reject invalid FPS values', () => {
      expect(validateFPS(0)).toBe(false)
      expect(validateFPS(-1)).toBe(false)
      expect(validateFPS(1000)).toBe(false)
    })
  })
})
```

### 2. Integration Tests

Test interactions between modules.

```typescript
// packages/intake/tests/importer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { importAnimation } from '../src/importer'
import { validateAnimation } from '../src/validator'
import * as fs from 'fs'

vi.mock('fs')
vi.mock('../src/validator')

describe('importer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('importAnimation', () => {
    it('should import valid animation', () => {
      vi.mocked(validateAnimation).mockResolvedValue({ valid: true })
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.cpSync).mockImplementation()

      const result = importAnimation('my-animation')

      expect(result.success).toBe(true)
      expect(fs.cpSync).toHaveBeenCalled()
    })

    it('should reject invalid animation', () => {
      vi.mocked(validateAnimation).mockResolvedValue({
        valid: false,
        errors: ['Guardrail violation: Math.random() found'],
      })

      const result = importAnimation('bad-animation')

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Guardrail violation: Math.random() found')
    })
  })
})
```

### 3. Validation Tests

Test Zod schema validation.

```typescript
// packages/core/tests/types.test.ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { validateData } from '../src/utils/validators'

// Test schema
const TestSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0).max(150),
  email: z.string().email(),
})

describe('Zod validation', () => {
  it('should validate correct data', () => {
    const data = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    }

    const result = validateData(TestSchema, data)
    expect(result.success).toBe(true)
    expect(result.data).toEqual(data)
  })

  it('should reject invalid data', () => {
    const data = {
      name: '', // Empty string
      age: -5, // Negative
      email: 'invalid', // Not email
    }

    const result = validateData(TestSchema, data)
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })
})
```

### 4. Asset Validation Tests

```typescript
// packages/assets/tests/validators.test.ts
import { describe, it, expect } from 'vitest'
import { validateAsset, isAssetPathValid, getAssetTypeFromExtension } from '../src/validators'

describe('asset validators', () => {
  describe('getAssetTypeFromExtension', () => {
    it('should identify image types', () => {
      expect(getAssetTypeFromExtension('image.png')).toBe('image')
      expect(getAssetTypeFromExtension('photo.jpg')).toBe('image')
      expect(getAssetTypeFromExtension('graphic.webp')).toBe('image')
    })

    it('should identify video types', () => {
      expect(getAssetTypeFromExtension('video.mp4')).toBe('video')
      expect(getAssetTypeFromExtension('clip.webm')).toBe('video')
    })

    it('should identify audio types', () => {
      expect(getAssetTypeFromExtension('sound.mp3')).toBe('audio')
      expect(getAssetTypeFromExtension('track.wav')).toBe('audio')
    })
  })

  describe('validateAsset', () => {
    it('should accept valid asset paths', () => {
      const result = validateAsset('/public/images/logo.png')
      expect(result.valid).toBe(true)
    })

    it('should reject paths with null bytes', () => {
      const result = validateAsset('/public/images/\0logo.png')
      expect(result.valid).toBe(false)
    })

    it('should reject absolute paths outside public', () => {
      const result = validateAsset('/etc/passwd')
      expect(result.valid).toBe(false)
    })
  })
})
```

### 5. Guardrail Tests

```typescript
// packages/intake/tests/guardrails.test.ts
import { describe, it, expect } from 'vitest'
import { checkGuardrails } from '../src/guardrails'

describe('guardrails', () => {
  it('should detect Math.random() usage', () => {
    const code = `
      const random = Math.random()
      return random
    `

    const result = checkGuardrails(code)
    expect(result.violations).toContain('Math.random() found')
  })

  it('should detect window/document without guard', () => {
    const code = `
      const width = window.innerWidth
    `

    const result = checkGuardrails(code)
    expect(result.violations).toContain('window used without typeof guard')
  })

  it('should detect eval() usage', () => {
    const code = `
      eval('console.log(1)')
    `

    const result = checkGuardrails(code)
    expect(result.violations).toContain('eval() detected')
  })

  it('should accept safe code', () => {
    const code = `
      import React from 'react'
      export const MyComponent = () => <div>Hello</div>
    `

    const result = checkGuardrails(code)
    expect(result.violations.length).toBe(0)
  })
})
```

## Test Setup

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Use global test APIs
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'build'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', '**/*.test.ts'],
    },
  },
})
```

### Test Setup File

```typescript
// tests/setup.ts
import { beforeEach, afterEach } from 'vitest'
import * as matchers from '@vitest/expect'

// Add custom matchers
expect.extend(matchers)

// Mock timers if needed
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})
```

## Best Practices

### 1. Use Descriptive Test Names

```typescript
// ❌ Bad
describe('Test', () => {
  it('test 1', () => { ... })
})

// ✅ Good
describe('CompositionValidator', () => {
  it('should reject composition ID with special characters', () => { ... })
})
```

### 2. Test Edge Cases

```typescript
describe('validatePositiveInteger', () => {
  it('should accept 0', () => {
    expect(validatePositiveInteger(0)).toBe(true)
  })

  it('should accept maximum safe integer', () => {
    expect(validatePositiveInteger(Number.MAX_SAFE_INTEGER)).toBe(true)
  })

  it('should reject Number.MAX_SAFE_INTEGER + 1', () => {
    expect(validatePositiveInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false)
  })
})
```

### 3. Use Data Providers

```typescript
describe('isValidFilePath', () => {
  const validPaths = ['/public/image.png', '/assets/video.mp4', '/nested/path/file.jpg']

  validPaths.forEach((path) => {
    it(`should accept ${path}`, () => {
      expect(isValidFilePath(path)).toBe(true)
    })
  })
})
```

### 4. Mock External Dependencies

```typescript
import { vi } from 'vitest'

it('should handle file read errors', () => {
  vi.mock('fs', () => ({
    readFileSync: vi.fn(() => {
      throw new Error('ENOENT: file not found')
    }),
  }))

  const result = readConfig('missing.json')
  expect(result.success).toBe(false)
  expect(result.error).toContain('file not found')
})
```

### 5. Test Async Code Properly

```typescript
it('should resolve with imported animation', async () => {
  const result = await importAnimation('my-animation')

  expect(result).toBeDefined()
  expect(result.path).toBe('packages/animations-external/my-animation')
})

it('should reject invalid animation', async () => {
  await expect(importAnimation('invalid-animation')).rejects.toThrow('Validation failed')
})
```

## Coverage Requirements

The project targets **80%+ code coverage**:

```bash
# Run with coverage
npm run test:coverage

# Coverage report shows:
# - Line coverage: 85%
# - Function coverage: 90%
# - Branch coverage: 75%
# - Statement coverage: 85%
```

### Coverage by Package

| Package  | Line Coverage | Function Coverage |
| -------- | ------------- | ----------------- |
| core     | 90%           | 95%               |
| renderer | 85%           | 88%               |
| intake   | 80%           | 85%               |
| assets   | 85%           | 90%               |

## Continuous Integration

Tests run automatically in CI:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: npm test

- name: Upload coverage
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
```

## Debugging Tests

### Run Single Test

```bash
npm test -- -t "should validate composition ID"
```

### Run with Verbose Output

```bash
npm test -- --reporter=verbose
```

### Debug in Browser

```bash
npm run test:ui
# Opens Vitest UI at http://localhost:51204
```

## Mocking Reference

### Common Mocks

```typescript
// Mock Node.js modules
vi.mock('fs')
vi.mock('path')
vi.mock('zlib')

// Mock external packages
vi.mock('@remotion/renderer')
vi.mock('zod')

// Mock internal modules
vi.mock('../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}))
```

### Spies

```typescript
import { vi, describe, it, expect } from 'vitest'

it('should call logger on error', () => {
  const loggerSpy = vi.spyOn(logger, 'error')

  handleError('Test error')

  expect(loggerSpy).toHaveBeenCalledWith('Test error')
})
```

## Troubleshooting Tests

### Issue: "Test timed out"

```typescript
// Increase timeout
it('long running test', async () => {
  // Test with 10 second timeout
}, 10000)
```

### Issue: "Cannot find module"

Ensure imports are correct and modules are installed.

### Issue: "Mock not working"

Check that mocks are set up before imports.

```typescript
// ✅ Correct order
vi.mock('fs')
import { myFunction } from '../src/myFunction'

// ❌ Wrong order
import { myFunction } from '../src/myFunction'
vi.mock('fs') // Too late!
```
