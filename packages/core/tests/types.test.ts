import {describe, it, expect} from 'vitest'
import {
  ExternalCompositionSchema,
  calculateDurationInSeconds,
  PropsSchema
} from '../src/types/composition'

describe('Composition Types', () => {
  describe('calculateDurationInSeconds', () => {
    it('should calculate duration correctly', () => {
      expect(calculateDurationInSeconds(90, 30)).toBe(3)
      expect(calculateDurationInSeconds(180, 30)).toBe(6)
      expect(calculateDurationInSeconds(60, 60)).toBe(1)
    })

    it('should handle fractional durations', () => {
      expect(calculateDurationInSeconds(90, 24)).toBeCloseTo(3.75, 2)
    })
  })

  describe('PropsSchema', () => {
    it('should validate valid props', () => {
      const result = PropsSchema.parse({
        text: 'Hello',
        color: '#ff0000',
        fontSize: 60
      })
      expect(result).toEqual({
        text: 'Hello',
        color: '#ff0000',
        fontSize: 60
      })
    })

    it('should accept empty props', () => {
      const result = PropsSchema.parse({})
      expect(result).toEqual({})
    })
  })

  describe('ExternalCompositionSchema', () => {
    it('should validate valid composition', () => {
      const composition = {
        id: 'TestComposition',
        component: 'mock-component',
        defaultProps: {text: 'Hello'},
        propsSchema: {},
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 90
      }

      const result = ExternalCompositionSchema.parse(composition)
      expect(result).toEqual(composition)
    })

    it('should reject invalid width', () => {
      const composition = {
        id: 'Test',
        component: 'mock',
        defaultProps: {},
        propsSchema: {},
        width: -1920,
        height: 1080,
        fps: 30,
        durationInFrames: 90
      }

      expect(() => ExternalCompositionSchema.parse(composition)).toThrow()
    })

    it('should reject empty ID', () => {
      const composition = {
        id: '',
        component: 'mock',
        defaultProps: {},
        propsSchema: {},
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 90
      }

      expect(() => ExternalCompositionSchema.parse(composition)).toThrow()
    })
  })
})
