import {describe, it, expect, vi} from 'vitest'
import {selectCompositionWrapper, SelectionOptions} from '../src/selector'

vi.mock('@remotion/renderer', () => ({
  selectComposition: vi.fn()
}))

describe('Selector', () => {
  describe('selectCompositionWrapper', () => {
    it('should select composition successfully', async () => {
      const {selectComposition} = await import('@remotion/renderer')

      ;(selectComposition as any).mockResolvedValue({
        id: 'TestComposition',
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 90,
        component: 'mock-component'
      })

      const options: SelectionOptions = {
        bundlePath: 'mock-bundle.js',
        compositionId: 'TestComposition',
        inputProps: {}
      }

      const result = await selectCompositionWrapper(options)

      expect(result.composition).toEqual({
        id: 'TestComposition',
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 90,
        durationInSeconds: 3
      })
      expect(result.component).toBe('mock-component')
    })

    it('should throw error for non-existent composition', async () => {
      const {selectComposition} = await import('@remotion/renderer')

      ;(selectComposition as any).mockResolvedValue(null)

      const options: SelectionOptions = {
        bundlePath: 'mock-bundle.js',
        compositionId: 'NonExistent',
        inputProps: {}
      }

      await expect(selectCompositionWrapper(options)).rejects.toThrow(
        'Composition "NonExistent" not found'
      )
    })
  })
})
