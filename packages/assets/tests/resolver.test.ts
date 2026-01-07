import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
  resolveAssetPath,
  resolvePublicPath,
  getAssetUrl,
  normalizePath,
  isAbsolute
} from 'path'
import {
  resolveAssetPath as resolvePathImpl,
  resolvePublicPath as resolvePublicImpl
} from '../src/resolver'

vi.mock('fs', () => ({
  existsSync: vi.fn(() => false)
}))

vi.mock('path', async () => {
  const actual = await vi.importActual('path')
  return {
    ...actual,
    isAbsolute: vi.fn((path: string) => path.startsWith('/') || /^[A-Za-z]:/.test(path))
  }
})

vi.mock('../src/resolver', async () => {
  const actual = await vi.importActual('../src/resolver')
  return {
    ...actual,
    resolveAssetPath: vi.fn((path: string) => `/resolved/${path}`),
    resolvePublicPath: vi.fn((path: string) => `/public/${path}`)
  }
})

describe('Resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('resolveAssetPath', () => {
    it('should resolve absolute paths', async () => {
      ;(resolvePathImpl as any).mockReturnValue('/absolute/path.jpg')

      const result = resolveAssetPath('/absolute/path.jpg')

      expect(result).toBe('/absolute/path.jpg')
    })

    it('should resolve relative paths', async () => {
      ;(resolvePathImpl as any).mockReturnValue('/resolved/relative.jpg')

      const result = resolveAssetPath('relative.jpg')

      expect(result).toBe('/resolved/relative.jpg')
    })
  })

  describe('resolvePublicPath', () => {
    it('should resolve public directory paths', async () => {
      ;(resolvePublicImpl as any).mockReturnValue('/public/assets/image.jpg')

      const result = resolvePublicPath('assets/image.jpg')

      expect(result).toBe('/public/assets/image.jpg')
    })
  })

  describe('getAssetUrl', () => {
    it('should return URL for absolute path', () => {
      const url = getAssetUrl('/absolute/path.jpg')
      expect(url).toBe('/absolute/path.jpg')
    })

    it('should return URL for relative path', () => {
      const url = getAssetUrl('relative/path.jpg')
      expect(url).toBe('/relative/path.jpg')
    })
  })

  describe('normalizePath', () => {
    it('should normalize backslashes to forward slashes', () => {
      const normalized = normalizePath('path\\to\\file.jpg')
      expect(normalized).toBe('path/to/file.jpg')
    })

    it('should collapse multiple slashes', () => {
      const normalized = normalizePath('path//to///file.jpg')
      expect(normalized).toBe('path/to/file.jpg')
    })

    it('should handle mixed separators', () => {
      const normalized = normalizePath('path\\/to//file.jpg')
      expect(normalized).toBe('path/to/file.jpg')
    })
  })
})
