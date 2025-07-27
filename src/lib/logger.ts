export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Lightweight structured logger.
 * In production, logs can be forwarded to an external service.
 */
class Logger {
  private level: LogLevel
  constructor(level: LogLevel = (process.env.NODE_ENV === 'production' ? 'info' : 'debug')) {
    this.level = level
  }

  private shouldLog(level: LogLevel): boolean {
    const order: Record<LogLevel, number> = {
      debug: 10,
      info: 20,
      warn: 30,
      error: 40,
    }
    return order[level] >= order[this.level]
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) console.debug(...args)
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) console.info(...args)
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) console.warn(...args)
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) console.error(...args)
  }
}

export const logger = new Logger()
