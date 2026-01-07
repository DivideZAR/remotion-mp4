import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {scaffold, ScaffoldOptions} from '../src/scaffold'
import {mkdir, writeFile, readFile} from 'fs/promises'
import {join} from 'path'

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual('fs/promises')
  return {
    ...actual,
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(() => Promise.resolve(''))
  }
})

vi.mock('../src/scaffold', async () => ({
  scaffold: vi.fn(() => Promise.resolve())
}))

describe('Scaffold', () => {
  let testOutDir: string
  const originalCwd = process.cwd

  beforeEach(() => {
    testOutDir = join(originalCwd, 'test-output')
    process.cwd = vi.fn(() => testOutDir)
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.cwd = originalCwd
  })

  describe('scaffold', () => {
    it('should scaffold 2D composition', async () => {
      const {scaffold} = await import('../src/scaffold')
      const {mkdir} = await import('fs/promises')

      const options: ScaffoldOptions = {
        name: 'TestAnimation',
        kind: '2d',
        outDir: testOutDir
      }

      await scaffold(options)

      expect(mkdir).toHaveBeenCalledWith(
        expect.any(String),
        {recursive: true}
      )
    })

    it('should scaffold 3D composition', async () => {
      const {scaffold} = await import('../src/scaffold')
      const {mkdir} = await import('fs/promises')

      const options: ScaffoldOptions = {
        name: 'TestAnimation3D',
        kind: '3d',
        outDir: testOutDir
      }

      await scaffold(options)

      expect(mkdir).toHaveBeenCalled()
    })

    it('should handle existing directory', async () => {
      const {mkdir} = await import('fs/promises')
      ;(mkdir as any).mockRejectedValue(
        new Error('EEXIST: directory already exists')
      )

      const {scaffold} = await import('../src/scaffold')

      const options: ScaffoldOptions = {
        name: 'TestAnimation',
        kind: '2d',
        outDir: testOutDir
      }

      await expect(scaffold(options)).resolves.not.toThrow()
    })
  })
})
