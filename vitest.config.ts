import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'out/', 'tests/', '**/*.test.ts', '**/*.config.ts'],
    },
  },
  resolve: {
    alias: {
      '@remotion-mp4/core': path.resolve(__dirname, 'packages/core/src'),
      '@remotion-mp4/renderer': path.resolve(__dirname, 'packages/renderer/src'),
      '@remotion-mp4/animations-2d': path.resolve(__dirname, 'packages/animations-2d/src'),
      '@remotion-mp4/animations-3d': path.resolve(__dirname, 'packages/animations-3d/src'),
      '@remotion-mp4/intake': path.resolve(__dirname, 'packages/intake/src'),
      '@remotion-mp4/assets': path.resolve(__dirname, 'packages/assets/src'),
    },
  },
})
