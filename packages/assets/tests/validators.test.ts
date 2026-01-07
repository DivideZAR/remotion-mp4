import {describe, it, expect, vi, beforeEach} from 'vitest'
import {
  validateAsset,
  validateAssetList,
  isAssetPathValid
} from '../src/validators'

vi.mock('fs/promises', () => ({
  stat: vi.fn(() => Promise.resolve({isFile: () => true, size: 1024 * 1024})),
  readFile: vi.fn(() => Promise.resolve('base64data'))
}))

describe('Validators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateAsset', () => {
    it('should validate a valid image asset', async () => {
      const result = await validateAsset('test.jpg')

      expect(result.valid).toBe(true)
      expect(result.asset).toBeDefined()
      expect(result.asset?.type).toBe('image')
    })

    it('should validate a valid video asset', async () => {
      const {stat} = await import('fs/promises')
      ;(stat as any).mockResolvedValue({
        isFile: () => true,
        size: 10 * 1024 * 1024 // 10MB
      })

      const result = await validateAsset('test.mp4')

      expect(result.valid).toBe(true)
      expect(result.asset?.type).toBe('video')
    })

    it('should reject invalid file extension', async () => {
      const result = await validateAsset('test.txt')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('Unsupported file extension')
    })

    it('should reject oversized image', async () => {
      const {stat} = await import('fs/promises')
      ;(stat as any).mockResolvedValue({
        isFile: () => true,
        size: 15 * 1024 * 1024 // 15MB, over 10MB limit
      })

      const result = await validateAsset('test.jpg')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds limit')
    })

    it('should reject non-existent file', async () => {
      const {stat} = await import('fs/promises')
      ;(stat as any).mockRejectedValue(new Error('File not found'))

      const result = await validateAsset('test.jpg')

      expect(result.valid).toBe(false)
      expect(result.error).toContain('not a file')
    })
  })

  describe('validateAssetList', () => {
    it('should validate multiple assets', async () => {
      const results = await validateAssetList(['test.jpg', 'test.mp4'])

      expect(results).toHaveLength(2)
      expect(results.every((r) => r.valid !== undefined)).toBe(true)
    })
  })

  describe('isAssetPathValid', () => {
    it('should accept valid asset paths', () => {
      expect(isAssetPathValid('test.jpg')).toBe(true)
      expect(isAssetPathValid('path/to/file.mp4')).toBe(true)
      expect(isAssetPathValid('test.png')).toBe(true)
    })

    it('should reject invalid extensions', () => {
      expect(isAssetPathValid('test.txt')).toBe(false)
      expect(isAssetPathValid('test.exe')).toBe(false)
    })
  })
})
