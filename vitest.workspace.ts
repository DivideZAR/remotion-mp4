import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'out/',
        'tests/',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/remotion.config.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@remotion-mp4/core': 'packages/core/src',
      '@remotion-mp4/renderer': 'packages/renderer/src',
      '@remotion-mp4/animations-2d': 'packages/animations-2d/src',
      '@remotion-mp4/animations-3d': 'packages/animations-3d/src',
      '@remotion-mp4/animations-external': 'packages/animations-external/src',
      '@remotion-mp4/intake': 'packages/intake/src',
      '@remotion-mp4/assets': 'packages/assets/src'
    }
  }
})
