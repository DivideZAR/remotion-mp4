import {describe, it, expect, vi, beforeEach} from 'vitest'
import {importPackage, importAll} from '../src/importer'
import {readFile, mkdir, cp} from 'fs/promises'
import {join} from 'path'

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual('fs/promises')
  return {
    ...actual,
    stat: vi.fn(() => Promise.resolve({isFile: () => true})),
    mkdir: vi.fn(() => Promise.resolve()),
    cp: vi.fn(() => Promise.resolve()),
    readdir: vi.fn(() => Promise.resolve(['test-anim'])),
    readFile: vi.fn(() => Promise.resolve('export test'))
  }
})

vi.mock('@remotion-mp4/core', async () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  }
}))

describe('Importer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('importPackage', () => {
    it('should import package successfully', async () => {
      const {importPackage} = await import('../src/importer')

      const {logger} = await import('@remotion-mp4/core')

      await importPackage({source: 'test-anim'})

      expect(logger.info).toHaveBeenCalledWith(expect.any(String))
    })

    it('should handle non-existent source', async () => {
      const {stat} = await import('fs/promises')
      ;(stat as any).mockRejectedValue(new Error('File not found'))

      const {importPackage} = await import('../src/importer')

      await expect(
        importPackage({source: 'non-existent'})
      ).rejects.toThrow('Source package not found')
    })
  })

  describe('importAll', () => {
    it('should import all validated packages', async () => {
      const {importAll} = await import('../src/importer')

      const {validate} = await import('../src/validator')
      vi.mocked(validate).mockResolvedValue([
        {name: 'test-anim', valid: true, errors: [], warnings: []}
      ])

      await importAll()

      expect(validate).toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const {importAll} = await import('../src/importer')

      const {validate} = await import('../src/validator')
      vi.mocked(validate).mockResolvedValue([
        {name: 'test-anim', valid: false, errors: ['error'], warnings: []}
      ])

      await expect(importAll()).rejects.toThrow('Import failed')
    })
  })
})
