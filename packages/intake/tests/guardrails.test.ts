import {describe, it, expect, vi} from 'vitest'
import {
  checkGuardrails,
  GUARDRAILS,
  explainGuardrail,
  getGuardrailFix
} from '../src/guardrails'

vi.mock('../src/guardrails', async () => ({
  checkGuardrails: vi.fn(() =>
    Promise.resolve({errors: [], warnings: []})
  )
}))

describe('Guardrails', () => {
  describe('checkGuardrails', () => {
    it('should detect Math.random() usage', async () => {
      const code = `const x = Math.random()`

      const {checkGuardrails} = await import('../src/guardrails')

      const result = await checkGuardrails('test.ts', code)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].code).toBe('NO_MATH_RANDOM')
    })

    it('should detect fetch() without async', async () => {
      const code = `const data = fetch(url)`

      const {checkGuardrails} = await import('../src/guardrails')

      const result = await checkGuardrails('test.ts', code)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].code).toBe('FETCH_WITHOUT_ASYNC')
    })

    it('should detect window without typeof', async () => {
      const code = `const w = window.width`

      const {checkGuardrails} = await import('../src/guardrails')

      const result = await checkGuardrails('test.ts', code)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].code).toBe('WINDOW_DOCUMENT_WITHOUT_GUARD')
    })

    it('should detect eval()', async () => {
      const code = `const x = eval('1 + 1')`

      const {checkGuardrails} = await import('../src/guardrails')

      const result = await checkGuardrails('test.ts', code)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].code).toBe('EVAL_OR_FUNCTION')
    })
  })

  describe('explainGuardrail', () => {
    it('should explain NO_MATH_RANDOM', () => {
      const explanation = explainGuardrail('NO_MATH_RANDOM')

      expect(explanation).toContain('non-deterministic')
      expect(explanation).toContain('seededRandom')
    })

    it('should explain FETCH_WITHOUT_ASYNC', () => {
      const explanation = explainGuardrail('FETCH_WITHOUT_ASYNC')

      expect(explanation).toContain('delayRender')
      expect(explanation).toContain('SSR')
    })
  })

  describe('GUARDRAILS constant', () => {
    it('should have all guardrails defined', () => {
      expect(Object.keys(GUARDRAILS)).toContain('NO_MATH_RANDOM')
      expect(Object.keys(GUARDRAILS)).toContain('FETCH_WITHOUT_ASYNC')
      expect(Object.keys(GUARDRAILS)).toContain('WINDOW_DOCUMENT_WITHOUT_GUARD')
      expect(Object.keys(GUARDRAILS)).toContain('EVAL_OR_FUNCTION')
      expect(Object.keys(GUARDRAILS)).toContain('FS_OPERATIONS')
    })
  })
})
