import {describe, it, expect, beforeEach} from 'vitest'
import {Logger, LogLevel, createLogger} from '../src/utils/logger'

describe('Logger', () => {
  let logger: Logger
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  }

  let logs: string[] = []

  beforeEach(() => {
    logger = new Logger({level: LogLevel.DEBUG, enableColors: false})

    // Mock console methods
    console.log = (...args) => logs.push(args.join(' '))
    console.warn = (...args) => logs.push(args.join(' '))
    console.error = (...args) => logs.push(args.join(' '))

    logs = []
  })

  afterEach(() => {
    // Restore console
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
  })

  describe('log levels', () => {
    it('should log debug messages when level is DEBUG', () => {
      logger.debug('Debug message')
      expect(logs.some((log) => log.includes('Debug message'))).toBe(true)
    })

    it('should log info messages when level is INFO', () => {
      logger.info('Info message')
      expect(logs.some((log) => log.includes('Info message'))).toBe(true)
    })

    it('should log warn messages when level is WARN', () => {
      logger.warn('Warning message')
      expect(logs.some((log) => log.includes('Warning message'))).toBe(true)
    })

    it('should log error messages when level is ERROR', () => {
      logger.error('Error message')
      expect(logs.some((log) => log.includes('Error message'))).toBe(true)
    })

    it('should not log debug when level is INFO', () => {
      logger.setLevel(LogLevel.INFO)
      logger.debug('Debug message')
      expect(logs.length).toBe(0)
    })

    it('should not log info when level is WARN', () => {
      logger.setLevel(LogLevel.WARN)
      logger.info('Info message')
      expect(logs.length).toBe(0)
    })
  })

  describe('prefix', () => {
    it('should include prefix in messages', () => {
      const prefixedLogger = new Logger({
        level: LogLevel.INFO,
        prefix: 'test',
        enableColors: false
      })

      prefixedLogger.info('Message')

      expect(logs.some((log) => log.includes('[test]'))).toBe(true)
      expect(logs.some((log) => log.includes('Message'))).toBe(true)
    })
  })

  describe('context', () => {
    it('should store context in log entries', () => {
      logger.info('Message', {key: 'value'})

      const logEntries = logger.getLogs()
      expect(logEntries).toHaveLength(1)
      expect(logEntries[0].context).toEqual({key: 'value'})
    })
  })

  describe('log history', () => {
    it('should store all logs', () => {
      logger.info('First')
      logger.warn('Second')
      logger.error('Third')

      const allLogs = logger.getLogs()
      expect(allLogs).toHaveLength(3)
    })

    it('should clear logs', () => {
      logger.info('Message')
      logger.clearLogs()

      expect(logger.getLogs()).toHaveLength(0)
    })
  })

  describe('createLogger', () => {
    it('should create logger with default level', () => {
      const defaultLogger = createLogger()
      defaultLogger.info('Test')

      expect(logs.some((log) => log.includes('Test'))).toBe(true)
    })

    it('should create logger with custom prefix', () => {
      const customLogger = createLogger('custom')
      customLogger.info('Test')

      expect(logs.some((log) => log.includes('[custom]'))).toBe(true)
    })
  })
})
