import {describe, it, expect, beforeAll} from 'vitest'
import {renderToMp4} from '@remotion-mp4/renderer'
import {existsSync} from 'fs'

describe('E2e: Render All Compositions', () => {
  beforeAll(() => {
    const outDir = 'out'

    if (!existsSync(outDir)) {
      throw new Error('out/ directory does not exist. Run: mkdir out/')
    }
  })

  const compositions = [
    {id: 'SimpleText', name: 'SimpleText', outputPath: 'out/text.mp4'},
    {id: 'Shapes', name: 'Shapes', outputPath: 'out/shapes.mp4'},
    {
      id: 'RotatingCube',
      name: 'RotatingCube',
      outputPath: 'out/cube.mp4',
      chromiumOptions: {gl: 'swangle'}
    }
  ]

  for (const comp of compositions) {
    it(`should render ${comp.name} successfully`, async () => {
      const result = await renderToMp4({
        compositionId: comp.id,
        outputPath: comp.outputPath,
        chromiumOptions: comp.chromiumOptions
      })

      expect(result.success).toBe(true)
      expect(result.outputPath).toBe(comp.outputPath)
      expect(result.duration).toBeGreaterThan(0)
      expect(result.sizeBytes).toBeGreaterThan(0)
    }, {timeout: 120000}) // 2 minute timeout
  }

  it('should render 3D composition with WebGL', async () => {
    const result = await renderToMp4({
      compositionId: 'RotatingCube',
      outputPath: 'out/cube-webgl.mp4',
      chromiumOptions: {gl: 'swangle'}
    })

    expect(result.success).toBe(true)
    expect(existsSync('out/cube-webgl.mp4')).toBe(true)
  }, {timeout: 120000})

  it('should enforce max duration on long animation', async () => {
    const result = await renderToMp4({
      compositionId: 'SimpleText',
      outputPath: 'out/text-long.mp4',
      maxDurationSeconds: 5 // Only 5 seconds allowed
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('exceeds max duration')
  }, {timeout: 120000})

  it('should handle missing composition gracefully', async () => {
    const result = await renderToMp4({
      compositionId: 'NonExistent',
      outputPath: 'out/missing.mp4'
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('not found')
  }, {timeout: 30000})
})
