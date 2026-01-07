import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
  preloadImage,
  preloadVideo,
  preloadAudio,
  preloadAsset,
  preloadAssets,
  preloadAssetSync
} from '../src/preload'

vi.mock('remotion', () => ({
  delayRender: vi.fn(() => ({id: 'test-handle'})),
  continueRender: vi.fn()
}))

vi.mock('../src/resolver', () => ({
  resolveAssetPath: vi.fn((path: string) => `/resolved/${path}`)
}))

describe('Preload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.Image = vi.fn(() => ({
      src: '',
      onload: null,
      onerror: null
    })) as any
    global.Audio = vi.fn(() => ({
      src: '',
      oncanplaythrough: null,
      onerror: null
    })) as any
    global.document = {
      createElement: vi.fn((tag) => {
        if (tag === 'img') {
          return new Image()
        }
        if (tag === 'video') {
          return new Audio()
        }
        return {}
      })
    } as any
  })

  describe('preloadImage', () => {
    it('should preload image successfully', async () => {
      const img = new Image()

      await expect(preloadImage('test.jpg')).resolves.toBeUndefined()

      expect(img.src).toBe('/resolved/test.jpg')
    })

    it('should handle image load error', async () => {
      const img = new Image()

      const errorPromise = preloadImage('test.jpg')

      setTimeout(() => {
        if (img.onerror) {
          img.onerror(new Error('Load failed'))
        }
      }, 10)

      await expect(errorPromise).rejects.toThrow('Load failed')
    })
  })

  describe('preloadVideo', () => {
    it('should preload video successfully', async () => {
      const {delayRender, continueRender} = await import('remotion')
      const handle = delayRender()

      await expect(preloadVideo('test.mp4')).resolves.toBeUndefined()

      expect(continueRender).toHaveBeenCalledWith(handle)
    })

    it('should handle video load error', async () => {
      await expect(preloadVideo('test.mp4')).rejects.toThrow('Load failed')
    })
  })

  describe('preloadAudio', () => {
    it('should preload audio successfully', async () => {
      const {delayRender, continueRender} = await import('remotion')
      const handle = delayRender()

      await expect(preloadAudio('test.mp3')).resolves.toBeUndefined()

      expect(continueRender).toHaveBeenCalledWith(handle)
    })

    it('should handle audio load error', async () => {
      await expect(preloadAudio('test.mp3')).rejects.toThrow('Load failed')
    })
  })

  describe('preloadAsset', () => {
    it('should preload image', async () => {
      await expect(preloadAsset('image', 'test.jpg')).resolves.toBeUndefined()
    })

    it('should preload video', async () => {
      await expect(preloadAsset('video', 'test.mp4')).resolves.toBeUndefined()
    })

    it('should preload audio', async () => {
      await expect(preloadAsset('audio', 'test.mp3')).resolves.toBeUndefined()
    })

    it('should throw on unknown type', async () => {
      await expect(
        preloadAsset('unknown' as any, 'test.xxx')
      ).rejects.toThrow('Unknown asset type: unknown')
    })
  })

  describe('preloadAssets', () => {
    it('should preload multiple assets', async () => {
      const assets = [
        {type: 'image' as const, path: 'test1.jpg'},
        {type: 'image' as const, path: 'test2.jpg'},
        {type: 'video' as const, path: 'test.mp4'}
      ]

      await expect(preloadAssets(assets)).resolves.toBeUndefined()
    })
  })

  describe('preloadAssetSync', () => {
    it('should preload image synchronously', () => {
      expect(() => preloadAssetSync('image', 'test.jpg')).not.toThrow()
    })

    it('should preload video synchronously with warning', () => {
      expect(() => preloadAssetSync('video', 'test.mp4')).not.toThrow()
    })

    it('should preload audio synchronously with warning', () => {
      expect(() => preloadAssetSync('audio', 'test.mp3')).not.toThrow()
    })
  })
})
