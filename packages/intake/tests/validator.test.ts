import {describe, it, expect, vi} from 'vitest'
import {validate, ValidationOptions} from '../src/validator'
import {stat} from 'fs/promises'

vi.mock('fs/promises', async () => {
  const actual = await vi.importActual('fs/promises')
  return {
    ...actual,
    stat: vi.fn(() => Promise.resolve({isFile: () => true, size: 1024})),
    readdir: vi.fn(() => Promise.resolve(['test-anim'])),
    readFile: vi.fn(() => Promise.resolve('export test'))
  }
})

describe('Validator', () => {
  describe('validate', () => {
    it('should validate all packages in input/', async () => {
      const results = await validate()

      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
    })

    it('should validate specific package', async () => {
      const {validate} = await import('../src/validator')

      const options: ValidationOptions = {
        source: 'test-anim'
      }

      const results = await validate(options)

      expect(results.length).toBe(1)
    })

    it('should report errors for invalid packages', async () => {
      const {stat} = await import('fs/promises')
      ;(stat as any).mockResolvedValue({
        isFile: () => false
      })

      const results = await validate()

      const invalidResults = results.filter((r) => !r.valid)

      expect(invalidResults.length).toBeGreaterThan(0)
      expect(invalidResults[0].error).toContain('does not exist')
    })
  })
})
