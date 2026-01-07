import {describe, it, expect} from 'vitest'
import {
  validateData,
  isValidCompositionId,
  validateCompositionId,
  isValidFilePath,
  validateFilePath,
  isPositiveInteger,
  validatePositiveInteger,
  isInRange,
  validateRange,
  validateFPS,
  validateCodec,
  validateWebGLMode,
  sanitizeString
} from '../src/utils/validators'

describe('Validators', () => {
  describe('validateData', () => {
    it('should validate valid data', () => {
      const schema = require('zod').z.object({
        name: require('zod').z.string()
      })

      const result = validateData(schema, {name: 'test'})
      expect(result).toEqual({name: 'test'})
    })

    it('should throw on invalid data', () => {
      const schema = require('zod').z.object({
        name: require('zod').z.string()
      })

      expect(() => validateData(schema, {name: 123})).toThrow('ValidationError')
    })
  })

  describe('isValidCompositionId', () => {
    it('should accept valid IDs', () => {
      expect(isValidCompositionId('MyComposition')).toBe(true)
      expect(isValidCompositionId('my_composition')).toBe(true)
      expect(isValidCompositionId('my-composition')).toBe(true)
      expect(isValidCompositionId('MyComposition123')).toBe(true)
    })

    it('should reject invalid IDs', () => {
      expect(isValidCompositionId('')).toBe(false)
      expect(isValidCompositionId('my composition')).toBe(false)
      expect(isValidCompositionId('my.composition')).toBe(false)
      expect(isValidCompositionId('my/composition')).toBe(false)
    })
  })

  describe('validateCompositionId', () => {
    it('should accept valid ID', () => {
      expect(() => validateCompositionId('MyComposition')).not.toThrow()
    })

    it('should throw on invalid ID', () => {
      expect(() => validateCompositionId('my composition')).toThrow('ValidationError')
    })
  })

  describe('isValidFilePath', () => {
    it('should accept valid paths', () => {
      expect(isValidFilePath('path/to/file.mp4')).toBe(true)
      expect(isValidFilePath('file.txt')).toBe(true)
      expect(isValidFilePath('/absolute/path/file.jpg')).toBe(true)
    })

    it('should reject paths with invalid characters', () => {
      expect(isValidFilePath('path/to/file<>.mp4')).toBe(false)
      expect(isValidFilePath('path/to/file|.txt')).toBe(false)
      expect(isValidFilePath('')).toBe(false)
    })
  })

  describe('validateFilePath', () => {
    it('should accept valid path', () => {
      expect(() => validateFilePath('path/to/file.mp4')).not.toThrow()
    })

    it('should throw on invalid path', () => {
      expect(() => validateFilePath('path/to/file<>.mp4')).toThrow('ValidationError')
    })
  })

  describe('isPositiveInteger', () => {
    it('should accept positive integers', () => {
      expect(isPositiveInteger(1)).toBe(true)
      expect(isPositiveInteger(100)).toBe(true)
      expect(isPositiveInteger(1.0)).toBe(true)
    })

    it('should reject non-positive or non-integers', () => {
      expect(isPositiveInteger(0)).toBe(false)
      expect(isPositiveInteger(-1)).toBe(false)
      expect(isPositiveInteger(1.5)).toBe(false)
      expect(isPositiveInteger('1' as any)).toBe(false)
      expect(isPositiveInteger(null as any)).toBe(false)
    })
  })

  describe('validatePositiveInteger', () => {
    it('should accept valid value', () => {
      expect(() => validatePositiveInteger(10, 'test')).not.toThrow()
    })

    it('should throw on invalid value', () => {
      expect(() => validatePositiveInteger(0, 'test')).toThrow('ValidationError')
      expect(() => validatePositiveInteger(-5, 'test')).toThrow('ValidationError')
    })
  })

  describe('isInRange', () => {
    it('should check range correctly', () => {
      expect(isInRange(5, 0, 10)).toBe(true)
      expect(isInRange(0, 0, 10)).toBe(true)
      expect(isInRange(10, 0, 10)).toBe(true)
      expect(isInRange(-1, 0, 10)).toBe(false)
      expect(isInRange(11, 0, 10)).toBe(false)
    })
  })

  describe('validateRange', () => {
    it('should accept value in range', () => {
      expect(() => validateRange(5, 0, 10, 'test')).not.toThrow()
    })

    it('should throw on value out of range', () => {
      expect(() => validateRange(15, 0, 10, 'test')).toThrow('ValidationError')
    })
  })

  describe('validateFPS', () => {
    it('should accept valid FPS', () => {
      expect(() => validateFPS(30)).not.toThrow()
      expect(() => validateFPS(60)).not.toThrow()
    })

    it('should throw on invalid FPS', () => {
      expect(() => validateFPS(15)).toThrow('ValidationError')
      expect(() => validateFPS(25)).toThrow('ValidationError')
    })
  })

  describe('validateCodec', () => {
    it('should accept valid codecs', () => {
      expect(() => validateCodec('h264')).not.toThrow()
      expect(() => validateCodec('prores')).not.toThrow()
    })

    it('should throw on invalid codec', () => {
      expect(() => validateCodec('invalid')).toThrow('ValidationError')
    })
  })

  describe('validateWebGLMode', () => {
    it('should accept valid modes', () => {
      expect(() => validateWebGLMode('angle')).not.toThrow()
      expect(() => validateWebGLMode('swangle')).not.toThrow()
    })

    it('should throw on invalid mode', () => {
      expect(() => validateWebGLMode('invalid')).toThrow('ValidationError')
    })
  })

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      )
    })

    it('should collapse whitespace', () => {
      expect(sanitizeString('hello   world')).toBe('hello world')
    })

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
    })
  })
})
