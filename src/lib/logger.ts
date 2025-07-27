/**
 * Logger utility for consistent logging across the application
 * Provides structured logging with different levels and environments
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export enum ErrorCategory {
  DATABASE = 'DATABASE',
  API = 'API',
  AUTH = 'AUTH',
  GENERAL = 'GENERAL'
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

class Logger {
  private level: LogLevel
  private isDevelopment: boolean
  private userContext?: string

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  setUserContext(userId: string) {
    this.userContext = userId
  }

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    const levelName = LogLevel[level]
    
    let formatted = `[${timestamp}] ${levelName}: ${message}`
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context)}`
    }

    if (this.userContext) {
      formatted += ` | User: ${this.userContext}`
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}`
      if (this.isDevelopment && error.stack) {
        formatted += `\nStack: ${error.stack}`
      }
    }
    
    return formatted
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    if (level < this.level) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    }

    const formattedMessage = this.formatMessage(entry)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
      case LogLevel.CRITICAL:
        console.error(`🚨 CRITICAL: ${formattedMessage}`)
        break
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log(LogLevel.WARN, message, context, error)
  }

  error(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  critical(message: string, context?: Record<string, unknown>, error?: Error) {
    this.log(LogLevel.CRITICAL, message, context, error)
  }

  // Convenience methods for common logging patterns
  logApiCall(method: string, url: string, status?: number, duration?: number) {
    this.info(`API ${method} ${url}`, {
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : undefined
    })
  }

  logDatabaseQuery(operation: string, table: string, duration?: number) {
    this.debug(`Database ${operation} on ${table}`, {
      operation,
      table,
      duration: duration ? `${duration}ms` : undefined
    })
  }

  logUserAction(userId: string, action: string, details?: Record<string, unknown>) {
    this.info(`User action: ${action}`, {
      userId,
      action,
      ...details
    })
  }

  logError(error: Error, context?: Record<string, unknown>) {
    this.error('An error occurred', context, error)
  }

  // Performance logging
  logPerformance(operation: string, durationOrContext?: number | Record<string, unknown>, maybeContext?: Record<string, unknown>) {
    // Support two call signatures:
    // 1. logPerformance('operation', duration, context?) – direct logging
    // 2. const end = logPerformance('operation') – returns an end timer
    if (typeof durationOrContext === 'number') {
      const duration = durationOrContext
      const context = maybeContext as Record<string, unknown> | undefined
      const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG
      this.log(level, `Performance: ${operation} took ${duration}ms`, {
        operation,
        duration,
        ...context
      })
      return
    }

    // Called with only an operation (and optional context)
    const getTime = () => (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now()
    const startTime = getTime()
    const context = durationOrContext as Record<string, unknown> | undefined

    return () => {
      const endTime = getTime()
      const duration = Math.round(endTime - startTime)
      const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG
      this.log(level, `Performance: ${operation} took ${duration}ms`, {
        operation,
        duration,
        ...context
      })
    }
  }

  logDatabaseOperation(operation: string, table: string, success: boolean, duration: number, error?: Error) {
    const level = success ? LogLevel.INFO : LogLevel.ERROR
    const status = success ? 'succeeded' : 'failed'
    this.log(level, `Database ${operation} on ${table} ${status} in ${duration}ms`, {
      operation,
      table,
      duration,
      success,
      error: error?.message
    }, error)
  }
}

// Create singleton instance
export const logger = new Logger()

// Export convenience functions
export const debug = (message: string, context?: Record<string, unknown>) => logger.debug(message, context)
export const info = (message: string, context?: Record<string, unknown>) => logger.info(message, context)
export const warn = (message: string, context?: Record<string, unknown>, error?: Error) => logger.warn(message, context, error)
export const error = (message: string, context?: Record<string, unknown>, error?: Error) => logger.error(message, context, error)
export const critical = (message: string, context?: Record<string, unknown>, error?: Error) => logger.critical(message, context, error)

// Export convenience methods
export const logApiCall = (method: string, url: string, status?: number, duration?: number) => logger.logApiCall(method, url, status, duration)
export const logDatabaseQuery = (operation: string, table: string, duration?: number) => logger.logDatabaseQuery(operation, table, duration)
export const logUserAction = (userId: string, action: string, details?: Record<string, unknown>) => logger.logUserAction(userId, action, details)
export const logError = (error: Error, context?: Record<string, unknown>) => logger.logError(error, context)
export const logPerformance = (operation: string, durationOrContext?: number | Record<string, unknown>, maybeContext?: Record<string, unknown>) =>
  logger.logPerformance(operation, durationOrContext as any, maybeContext as any)

export const logDatabaseOperation = (operation: string, table: string, success: boolean, duration: number, error?: Error) =>
  logger.logDatabaseOperation(operation, table, success, duration, error) 