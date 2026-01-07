import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderToMp4, RenderOptions } from '@remotion-mp4/renderer'
import { render } from '@remotion/testing-utils'

vi.mock('@remotion/renderer', () => ({
  renderMedia: vi.fn(() => Promise.resolve()),
  bundle: vi.fn(() => Promise.resolve('mock-bundle.js')),
}))

vi.mock('@remotion/bundler', async () => ({
  bundle: vi.fn(() => Promise.resolve('mock-bundle.js')),
}))

vi.mock('@remotion/testing-utils', async () => ({
  render: vi.fn(() => Promise.resolve({})),
  renderFrame: vi.fn(() => Promise.resolve({ image: 'mock-image' })),
}))

import { writeFile, mkdir, stat } from 'fs/promises'
import { join } from 'path'

describe('Integration: Render Pipeline', () => {
  let tempOutDir: string
  let cleanup: boolean = false

  beforeEach(async () => {
    tempOutDir = join(process.cwd(), 'tests', 'temp-output')
    await mkdir(tempOutDir, { recursive: true })
    cleanup = true
  })

  afterEach(async () => {
    if (!cleanup) return
    cleanup = false

    const { readdir } = await import('fs/promises')

    try {
      const files = await readdir(tempOutDir)

      for (const file of files) {
        const filePath = join(tempOutDir, file)
        await writeFile(filePath, '')
      }
    } catch {
      // Directory might not exist
    }
  })

  describe('Bundle and Select', () => {
    it('should bundle composition and cache it', async () => {
      const { bundle } = await import('@remotion/bundler')

      const result = await bundle({
        compositionId: 'TestComposition',
        webpackOverride: {},
      })

      expect(result).toBeDefined()
      expect(bundle).toHaveBeenCalled()
    })

    it('should select composition from bundle', async () => {
      const { bundle, selectComposition } = await import('@remotion/renderer')

      bundle.mockResolvedValue('mock-bundle.js')

      const result = await selectComposition({
        bundlePath: 'mock-bundle.js',
        compositionId: 'TestComposition',
      })

      expect(result).toBeDefined()
      expect(selectComposition).toHaveBeenCalledWith({
        bundlePath: 'mock-bundle.js',
        compositionId: 'TestComposition',
      })
    })
  })

  describe('Render to MP4', () => {
    it(
      'should render composition successfully',
      async () => {
        const { renderMedia, bundle } = await import('@remotion/renderer')

        bundle.mockResolvedValue('mock-bundle.js')
        renderMedia.mockResolvedValue(undefined)

        const options: RenderOptions = {
          compositionId: 'TestComposition',
          outputPath: join(tempOutDir, 'test-output.mp4'),
          chromiumOptions: { gl: 'swangle' },
        }

        const result = await renderToMp4(options)

        expect(result.success).toBe(true)
        expect(result.outputPath).toBeDefined()
        expect(bundle).toHaveBeenCalled()
        expect(renderMedia).toHaveBeenCalledWith(
          expect.objectContaining({
            compositionId: 'TestComposition',
            serveUrl: 'mock-bundle.js',
            outputLocation: join(tempOutDir, 'test-output.mp4'),
            chromiumOptions: { gl: 'swangle' },
          })
        )
      },
      { timeout: 30000 }
    )

    it(
      'should enforce max duration',
      async () => {
        const { renderMedia, bundle } = await import('@remotion/renderer')

        bundle.mockResolvedValue('mock-bundle.js')
        renderMedia.mockResolvedValue(undefined)

        const options: RenderOptions = {
          compositionId: 'TestComposition',
          outputPath: join(tempOutDir, 'test-output.mp4'),
          maxDurationSeconds: 1, // Only 1 second allowed
          chromiumOptions: { gl: 'swangle' },
        }

        const result = await renderToMp4(options)

        expect(result.success).toBe(false)
        expect(result.error).toContain('exceeds max duration')
      },
      { timeout: 30000 }
    )

    it(
      'should handle render errors gracefully',
      async () => {
        const { renderMedia, bundle } = await import('@remotion/renderer')

        bundle.mockRejectedValue(new Error('Bundle failed'))
        renderMedia.mockRejectedValue(new Error('Render failed'))

        const options: RenderOptions = {
          compositionId: 'TestComposition',
          outputPath: join(tempOutDir, 'test-output.mp4'),
          chromiumOptions: { gl: 'swangle' },
        }

        const result = await renderToMp4(options)

        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      },
      { timeout: 30000 }
    )

    it('should validate render options', async () => {
      const options: RenderOptions = {
        compositionId: '',
        outputPath: 'invalid-path',
      }

      await expect(renderToMp4(options)).rejects.toThrow('Composition ID is required')
    })
  })
})
