/**
 * Log level
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Log entry
 */
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel
  prefix?: string
  enableColors?: boolean
}

/**
 * Color codes for terminal output
 */
const Colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
}

/**
 * Logger class
 */
export class Logger {
  private config: LoggerConfig
  private logs: LogEntry[] = []

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: config?.level || LogLevel.INFO,
      prefix: config?.prefix || '',
      enableColors: config?.enableColors !== false
    }
  }

  /**
   * Check if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    return levels.indexOf(level) >= levels.indexOf(this.config.level)
  }

  /**
   * Format timestamp
   */
  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  /**
   * Format message with colors
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = this.formatTimestamp()
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : ''
    const levelLabel = level.toUpperCase().padEnd(5)

    if (!this.config.enableColors) {
      return `${timestamp} ${levelLabel} ${prefix}${message}`
    }

    const levelColor =
      level === LogLevel.ERROR
        ? Colors.red
        : level === LogLevel.WARN
          ? Colors.yellow
          : level === LogLevel.INFO
            ? Colors.green
            : Colors.blue

    return `${Colors.gray}${timestamp}${Colors.reset} ${levelColor}${levelLabel}${Colors.reset} ${prefix}${message}`
  }

  /**
   * Add log entry
   */
  private addEntry(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: this.formatTimestamp(),
      context
    }
    this.logs.push(entry)
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message)
      console.log(formatted)
      this.addEntry(LogLevel.DEBUG, message, context)
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message)
      console.log(formatted)
      this.addEntry(LogLevel.INFO, message, context)
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message)
      console.warn(formatted)
      this.addEntry(LogLevel.WARN, message, context)
    }
  }

  /**
   * Log error message
   */
  error(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage(LogLevel.ERROR, message)
      console.error(formatted)
      this.addEntry(LogLevel.ERROR, message, context)
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level
  }
}

/**
 * Create default logger
 */
export function createLogger(prefix?: string): Logger {
  const envLevel = process.env.LOG_LEVEL as LogLevel | undefined
  const level = envLevel || LogLevel.INFO

  return new Logger({prefix, level})
}

/**
 * Global logger instance
 */
export const logger = createLogger('remotion-mp4')
