import {describe, it, expect, beforeEach, vi} from 'vitest'
import {
  renderToMp4,
  validateRenderOptions,
  RenderOptions
} from '../src/renderer'

vi.mock('../src/bundler', () => ({
  bundleComposition: vi.fn(() => Promise.resolve({bundlePath: 'mock-bundle.js', cached: true}))
}))

vi.mock('../src/selector', () => ({
  selectCompositionWrapper: vi.fn(() =>
    Promise.resolve({
      composition: {
        id: 'TestComposition',
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 90,
        durationInSeconds: 3
      },
      component: 'mock-component'
    })
  )
}))

vi.mock('@remotion/renderer', () => ({
  renderMedia: vi.fn(() => Promise.resolve()),
  OnStartData: vi.fn()
}))

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual('fs/promises')
  return {
    ...actual,
    stat: vi.fn(() => Promise.resolve({size: 1024 * 1024}))
  }
}))

describe('Renderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateRenderOptions', () => {
    it('should accept valid options', async () => {
      const options: RenderOptions = {
        compositionId: 'TestComposition',
        outputPath: 'out/test.mp4',
        codec: 'h264'
      }

      await expect(validateRenderOptions(options)).resolves.toBeUndefined()
    })

    it('should reject missing composition ID', async () => {
      const options: RenderOptions = {
        compositionId: '',
        outputPath: 'out/test.mp4'
      }

      await expect(validateRenderOptions(options)).rejects.toThrow(
        'Composition ID is required'
      )
    })

    it('should reject missing output path', async () => {
      const options: RenderOptions = {
        compositionId: 'TestComposition',
        outputPath: ''
      }

      await expect(validateRenderOptions(options)).rejects.toThrow(
        'Output path is required'
      )
    })

    it('should reject invalid output extension', async () => {
      const options: RenderOptions = {
        compositionId: 'TestComposition',
        outputPath: 'out/test.mov'
      }

      await expect(validateRenderOptions(options)).rejects.toThrow(
        'must end with .mp4'
      )
    })
  })

  describe('renderToMp4', () => {
    it('should render composition successfully', async () => {
      const options: RenderOptions = {
        compositionId: 'TestComposition',
        outputPath: 'out/test.mp4',
        codec: 'h264',
        maxDurationSeconds: 10
      }

      const result = await renderToMp4(options)

      expect(result.success).toBe(true)
      expect(result.outputPath).toBe('out/test.mp4')
      expect(result.duration).toBe(3)
      expect(result.sizeBytes).toBe(1024 * 1024)
      expect(result.codec).toBe('h264')
      expect(result.renderTimeMs).toBeGreaterThan(0)
    })

    it('should enforce max duration', async () => {
      const options: RenderOptions = {
        compositionId: 'TestComposition',
        outputPath: 'out/test.mp4',
        maxDurationSeconds: 1 // Only 1 second allowed
      }

      const result = await renderToMp4(options)

      expect(result.success).toBe(false)
      expect(result.error).toContain('exceeds max duration')
    })

    it('should handle render errors', async () => {
      const {renderMedia} = await import('@remotion/renderer')
      ;(renderMedia as any).mockRejectedValue(new Error('Render failed'))

      const options: RenderOptions = {
        compositionId: 'TestComposition',
        outputPath: 'out/test.mp4'
      }

      const result = await renderToMp4(options)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Render failed')
    })
  })
})
