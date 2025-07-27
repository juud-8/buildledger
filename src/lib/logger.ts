/**
 * Production-Grade Logging System
 * 
 * Provides structured logging with different levels, context tracking,
 * and production-ready error reporting. Designed for scalability and debugging.
 * 
 * @author BuildLedger Team
 * @version 1.0.0
 */

import { Profile } from './types'

// Log levels for different environments
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

// Structured log entry interface
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: Error
  userId?: string
  sessionId?: string
  environment: string
  buildVersion?: string
}

// Context for enhanced debugging
export interface LogContext {
  component?: string
  function?: string
  operation?: string
  duration?: number
  metadata?: Record<string, unknown>
}

// Error classification for better handling
export enum ErrorCategory {
  AUTHENTICATION = 'auth',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business',
  EXTERNAL_API = 'external_api',
  FILE_SYSTEM = 'file_system',
  UNKNOWN = 'unknown'
}

// Performance monitoring interface
export interface PerformanceMetrics {
  operationName: string
  duration: number
  timestamp: string
  success: boolean
  resourceUsage?: {
    memory?: number
    cpu?: number
  }
}

class Logger {
  private static instance: Logger
  private readonly environment: string
  private readonly buildVersion: string
  private readonly logLevel: LogLevel
  private sessionId: string
  private performanceMetrics: PerformanceMetrics[] = []

  private constructor() {
    this.environment = process.env.NODE_ENV || 'development'
    this.buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION || '1.0.0'
    this.logLevel = this.getLogLevel()
    this.sessionId = this.generateSessionId()
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Sets the current user context for enhanced logging
   */
  public setUserContext(userId: string, profile?: Profile): void {
    this.log(LogLevel.DEBUG, 'User context updated', {
      component: 'Logger',
      function: 'setUserContext',
      metadata: { 
        userId, 
        planTier: profile?.plan_tier,
        hasLogo: !!profile?.logo_url
      }
    })
  }

  /**
   * Debug level logging for development insights
   */
  public debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Information level logging for operational insights
   */
  public info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Warning level logging for potential issues
   */
  public warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error)
  }

  /**
   * Error level logging for recoverable errors
   */
  public error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error)
    
    // Send to error reporting service in production
    if (this.environment === 'production') {
      this.reportToCrashAnalytics(message, error, context)
    }
  }

  /**
   * Critical level logging for system failures
   */
  public critical(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.CRITICAL, message, context, error)
    
    // Immediately alert monitoring systems
    if (this.environment === 'production') {
      this.sendCriticalAlert(message, error, context)
    }
  }

  /**
   * Performance monitoring for operations
   */
  public startPerformanceTimer(operationName: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const duration = performance.now() - startTime
      const metric: PerformanceMetrics = {
        operationName,
        duration,
        timestamp: new Date().toISOString(),
        success: true
      }
      
      this.performanceMetrics.push(metric)
      
      // Log slow operations
      if (duration > 1000) { // 1 second threshold
        this.warn(`Slow operation detected: ${operationName}`, {
          component: 'Performance',
          operation: operationName,
          duration,
          metadata: { threshold: '1000ms' }
        })
      }
      
      this.debug(`Operation completed: ${operationName}`, {
        component: 'Performance',
        operation: operationName,
        duration
      })
    }
  }

  /**
   * Database operation logging with enhanced context
   */
  public logDatabaseOperation(
    operation: string,
    table: string,
    success: boolean,
    duration?: number,
    error?: Error
  ): void {
    const context: LogContext = {
      component: 'Database',
      operation,
      metadata: { 
        table, 
        success,
        duration: duration ? `${duration}ms` : undefined
      }
    }

    if (success) {
      this.debug(`Database ${operation} successful on ${table}`, context)
    } else {
      this.error(`Database ${operation} failed on ${table}`, context, error)
    }
  }

  /**
   * API request logging for external services
   */
  public logApiRequest(
    service: string,
    endpoint: string,
    method: string,
    statusCode?: number,
    duration?: number,
    error?: Error
  ): void {
    const context: LogContext = {
      component: 'ExternalAPI',
      operation: `${method} ${endpoint}`,
      metadata: {
        service,
        statusCode,
        duration: duration ? `${duration}ms` : undefined
      }
    }

    if (statusCode && statusCode >= 200 && statusCode < 300) {
      this.info(`API request successful: ${service}`, context)
    } else {
      this.error(`API request failed: ${service}`, context, error)
    }
  }

  /**
   * User action logging for analytics and debugging
   */
  public logUserAction(
    action: string,
    component: string,
    metadata?: Record<string, unknown>
  ): void {
    this.info(`User action: ${action}`, {
      component,
      operation: action,
      metadata
    })
  }

  /**
   * Business metric logging for analytics
   */
  public logBusinessMetric(
    metric: string,
    value: number | string,
    metadata?: Record<string, unknown>
  ): void {
    this.info(`Business metric: ${metric}`, {
      component: 'Analytics',
      operation: 'metric_collection',
      metadata: { metric, value, ...metadata }
    })
  }

  /**
   * Core logging implementation
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    // Skip if log level is below threshold
    if (level < this.logLevel) return

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } as Error : undefined,
      sessionId: this.sessionId,
      environment: this.environment,
      buildVersion: this.buildVersion
    }

    // Format for console output in development
    if (this.environment === 'development') {
      this.consoleOutput(logEntry)
    } else {
      // Send to logging service in production
      this.sendToLoggingService(logEntry)
    }
  }

  /**
   * Console output for development environment
   */
  private consoleOutput(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${LogLevel[entry.level]}]`
    const contextStr = entry.context 
      ? ` [${entry.context.component}${entry.context.function ? `::${entry.context.function}` : ''}]`
      : ''
    
    const message = `${prefix}${contextStr} ${entry.message}`
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context?.metadata || '')
        break
      case LogLevel.INFO:
        console.info(message, entry.context?.metadata || '')
        break
      case LogLevel.WARN:
        console.warn(message, entry.context?.metadata || '', entry.error || '')
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.context?.metadata || '', entry.error || '')
        break
    }
  }

  /**
   * Send logs to external logging service (production)
   */
  private async sendToLoggingService(entry: LogEntry): Promise<void> {
    try {
      // Replace with your logging service endpoint
      // Examples: DataDog, LogRocket, Sentry, CloudWatch
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      // Fallback to console if logging service fails
      console.error('Failed to send log to service:', error)
      this.consoleOutput(entry)
    }
  }

  /**
   * Report to crash analytics service
   */
  private async reportToCrashAnalytics(
    message: string, 
    error?: Error, 
    context?: LogContext
  ): Promise<void> {
    try {
      // Replace with your crash analytics service
      // Examples: Sentry, Bugsnag, Crashlytics
      await fetch('/api/crash-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, error, context, sessionId: this.sessionId })
      })
    } catch (reportError) {
      console.error('Failed to report crash:', reportError)
    }
  }

  /**
   * Send critical alerts to monitoring systems
   */
  private async sendCriticalAlert(
    message: string,
    error?: Error,
    context?: LogContext
  ): Promise<void> {
    try {
      // Replace with your alerting service
      // Examples: PagerDuty, Slack webhooks, SMS alerts
      await fetch('/api/critical-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          error, 
          context, 
          timestamp: new Date().toISOString(),
          environment: this.environment
        })
      })
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError)
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  public getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics]
  }

  /**
   * Clear performance metrics (useful for memory management)
   */
  public clearPerformanceMetrics(): void {
    this.performanceMetrics = []
  }

  /**
   * Determine log level based on environment
   */
  private getLogLevel(): LogLevel {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL
    
    switch (envLevel?.toUpperCase()) {
      case 'DEBUG': return LogLevel.DEBUG
      case 'INFO': return LogLevel.INFO
      case 'WARN': return LogLevel.WARN
      case 'ERROR': return LogLevel.ERROR
      case 'CRITICAL': return LogLevel.CRITICAL
      default:
        return this.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG
    }
  }

  /**
   * Generate unique session ID for tracking user sessions
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Export utility functions for specific use cases
export const logError = (
  message: string, 
  error: Error, 
  component: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN
) => {
  logger.error(message, {
    component,
    operation: 'error_handling',
    metadata: { category, errorName: error.name }
  }, error)
}

export const logPerformance = (operationName: string) => {
  return logger.startPerformanceTimer(operationName)
}

export const logUserAction = (action: string, component: string, metadata?: Record<string, unknown>) => {
  logger.logUserAction(action, component, metadata)
}

export const logBusinessMetric = (metric: string, value: number | string, metadata?: Record<string, unknown>) => {
  logger.logBusinessMetric(metric, value, metadata)
}