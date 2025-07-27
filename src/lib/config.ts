/**
 * Application Configuration System
 * 
 * Centralized configuration management with validation, type safety,
 * and environment-specific settings. Designed for scalability and security.
 * 
 * @author BuildLedger Team
 * @version 1.0.0
 */

// Removed logger import to avoid circular dependency

// Environment types for better type safety
export type Environment = 'development' | 'staging' | 'production' | 'test'

// Feature flags for controlled rollouts
export interface FeatureFlags {
  enableProfileManagement: boolean
  enableLogoUpload: boolean
  enableAdvancedAnalytics: boolean
  enableEmailNotifications: boolean
  enablePdfGeneration: boolean
  enableStripeIntegration: boolean
  enableBetaFeatures: boolean
  maxFileUploadSize: number // in bytes
  maxClientsPerUser: number
  maxInvoicesPerMonth: number
}

// Database configuration
export interface DatabaseConfig {
  url: string
  anonKey: string
  serviceRoleKey?: string
  poolSize: number
  timeout: number
  retryAttempts: number
}

// External service configurations
export interface EmailConfig {
  provider: 'emailjs' | 'sendgrid' | 'resend'
  emailjs?: {
    serviceId: string
    templateId: string
    publicKey: string
  }
  sendgrid?: {
    apiKey: string
    fromEmail: string
  }
  resend?: {
    apiKey: string
    fromEmail: string
  }
}

export interface PaymentConfig {
  stripe?: {
    publishableKey: string
    secretKey?: string
    webhookSecret?: string
  }
  enabled: boolean
}

// Security configuration
export interface SecurityConfig {
  sessionTimeout: number // in milliseconds
  maxLoginAttempts: number
  csrfEnabled: boolean
  corsOrigins: string[]
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
    burstLimit: number
  }
}

// Performance configuration
export interface PerformanceConfig {
  cacheEnabled: boolean
  cacheTtl: number // in seconds
  enableCompression: boolean
  enableLazyLoading: boolean
  batchSize: number
  maxConcurrentRequests: number
}

// Monitoring and observability
export interface MonitoringConfig {
  errorReporting: {
    enabled: boolean
    service: 'sentry' | 'bugsnag' | 'rollbar'
    dsn?: string
  }
  analytics: {
    enabled: boolean
    service: 'google' | 'mixpanel' | 'amplitude'
    trackingId?: string
  }
  performanceMonitoring: {
    enabled: boolean
    sampleRate: number
    slowQueryThreshold: number
  }
}

// Complete application configuration
export interface AppConfig {
  environment: Environment
  appName: string
  version: string
  baseUrl: string
  apiBaseUrl: string
  database: DatabaseConfig
  email: EmailConfig
  payment: PaymentConfig
  security: SecurityConfig
  performance: PerformanceConfig
  monitoring: MonitoringConfig
  featureFlags: FeatureFlags
}

/**
 * Configuration validation utility
 */
class ConfigValidator {
  private static requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ] as const

  private static optionalEnvVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_EMAILJS_SERVICE_ID',
    'NEXT_PUBLIC_EMAILJS_TEMPLATE_ID',
    'NEXT_PUBLIC_EMAILJS_PUBLIC_KEY',
    'SENDGRID_API_KEY',
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SENTRY_DSN',
    'NEXT_PUBLIC_ANALYTICS_ID'
  ] as const

  /**
   * Validates all required environment variables
   */
  public static validateEnvironment(): { isValid: boolean; missingVars: string[] } {
    const missingVars: string[] = []

    for (const envVar of this.requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar)
      }
    }

    return {
      isValid: missingVars.length === 0,
      missingVars
    }
  }

  /**
   * Validates URL format
   */
  public static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  /**
   * Validates email format
   */
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validates configuration object
   */
  public static validateConfig(config: AppConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate URLs
    if (!this.isValidUrl(config.database.url)) {
      errors.push('Invalid database URL')
    }

    if (!this.isValidUrl(config.baseUrl)) {
      errors.push('Invalid base URL')
    }

    // Validate feature flag constraints
    if (config.featureFlags.maxFileUploadSize > 50 * 1024 * 1024) { // 50MB limit
      errors.push('Max file upload size exceeds safe limit (50MB)')
    }

    // Validate security settings
    if (config.security.sessionTimeout < 300000) { // 5 minutes minimum
      errors.push('Session timeout too short (minimum 5 minutes)')
    }

    // Validate performance settings
    if (config.performance.maxConcurrentRequests > 100) {
      errors.push('Max concurrent requests too high (performance risk)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Configuration factory for different environments
 */
class ConfigFactory {
  /**
   * Creates configuration based on current environment
   */
  public static create(): AppConfig {
    const environment = this.getEnvironment()
    const baseConfig = this.getBaseConfig()
    const environmentConfig = this.getEnvironmentSpecificConfig(environment)

    return {
      ...baseConfig,
      ...environmentConfig,
      environment
    }
  }

  /**
   * Gets the current environment
   */
  private static getEnvironment(): Environment {
    const nodeEnv = process.env.NODE_ENV as Environment
    const customEnv = process.env.NEXT_PUBLIC_APP_ENV as Environment

    return customEnv || nodeEnv || 'development'
  }

  /**
   * Base configuration shared across all environments
   */
  private static getBaseConfig(): Omit<AppConfig, 'environment'> {
    return {
      appName: 'BuildLedger',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
      
      database: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        poolSize: parseInt(process.env.DB_POOL_SIZE || '20'),
        timeout: parseInt(process.env.DB_TIMEOUT || '30000'),
        retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3')
      },

      email: {
        provider: (process.env.EMAIL_PROVIDER as 'emailjs' | 'sendgrid' | 'resend') || 'emailjs',
        emailjs: {
          serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
          templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
          publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
        },
        sendgrid: {
          apiKey: process.env.SENDGRID_API_KEY || '',
          fromEmail: process.env.SENDGRID_FROM_EMAIL || ''
        },
        resend: {
          apiKey: process.env.RESEND_API_KEY || '',
          fromEmail: process.env.RESEND_FROM_EMAIL || ''
        }
      },

      payment: {
        enabled: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        stripe: {
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
          secretKey: process.env.STRIPE_SECRET_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        }
      },

      security: {
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
        csrfEnabled: process.env.CSRF_ENABLED !== 'false',
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        rateLimiting: {
          enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
          requestsPerMinute: parseInt(process.env.RATE_LIMIT_RPM || '100'),
          burstLimit: parseInt(process.env.RATE_LIMIT_BURST || '200')
        }
      },

      performance: {
        cacheEnabled: process.env.CACHE_ENABLED !== 'false',
        cacheTtl: parseInt(process.env.CACHE_TTL || '300'), // 5 minutes
        enableCompression: process.env.COMPRESSION_ENABLED !== 'false',
        enableLazyLoading: process.env.LAZY_LOADING_ENABLED !== 'false',
        batchSize: parseInt(process.env.BATCH_SIZE || '50'),
        maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10')
      },

      monitoring: {
        errorReporting: {
          enabled: !!process.env.SENTRY_DSN,
          service: 'sentry',
          dsn: process.env.SENTRY_DSN
        },
        analytics: {
          enabled: !!process.env.NEXT_PUBLIC_ANALYTICS_ID,
          service: 'google',
          trackingId: process.env.NEXT_PUBLIC_ANALYTICS_ID
        },
        performanceMonitoring: {
          enabled: process.env.PERFORMANCE_MONITORING_ENABLED !== 'false',
          sampleRate: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE || '0.1'),
          slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '1000')
        }
      },

      featureFlags: {
        enableProfileManagement: process.env.FEATURE_PROFILE_MANAGEMENT !== 'false',
        enableLogoUpload: process.env.FEATURE_LOGO_UPLOAD !== 'false',
        enableAdvancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS !== 'false',
        enableEmailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'false',
        enablePdfGeneration: process.env.FEATURE_PDF_GENERATION !== 'false',
        enableStripeIntegration: process.env.FEATURE_STRIPE_INTEGRATION !== 'false',
        enableBetaFeatures: process.env.FEATURE_BETA_FEATURES === 'true',
        maxFileUploadSize: parseInt(process.env.MAX_FILE_UPLOAD_SIZE || '5242880'), // 5MB
        maxClientsPerUser: parseInt(process.env.MAX_CLIENTS_PER_USER || '100'),
        maxInvoicesPerMonth: parseInt(process.env.MAX_INVOICES_PER_MONTH || '1000')
      }
    }
  }

  /**
   * Environment-specific configuration overrides
   */
  private static getEnvironmentSpecificConfig(environment: Environment): Partial<AppConfig> {
    switch (environment) {
      case 'production':
        return {
          security: {
            sessionTimeout: 1800000, // 30 minutes
            maxLoginAttempts: 3,
            csrfEnabled: true,
            corsOrigins: [process.env.NEXT_PUBLIC_BASE_URL || 'https://buildledger.com'],
            rateLimiting: {
              enabled: true,
              requestsPerMinute: 60,
              burstLimit: 100
            }
          },
          performance: {
            cacheEnabled: true,
            cacheTtl: 600, // 10 minutes
            enableCompression: true,
            enableLazyLoading: true,
            batchSize: 100,
            maxConcurrentRequests: 20
          },
          monitoring: {
            errorReporting: { enabled: true, service: 'sentry', dsn: process.env.SENTRY_DSN },
            analytics: { enabled: true, service: 'google', trackingId: process.env.NEXT_PUBLIC_ANALYTICS_ID },
            performanceMonitoring: { enabled: true, sampleRate: 0.1, slowQueryThreshold: 500 }
          }
        }

      case 'staging':
        return {
          security: {
            sessionTimeout: 3600000, // 1 hour
            maxLoginAttempts: 5,
            csrfEnabled: true,
            corsOrigins: ['https://staging.buildledger.com'],
            rateLimiting: {
              enabled: true,
              requestsPerMinute: 200,
              burstLimit: 400
            }
          },
          monitoring: {
            errorReporting: { enabled: true, service: 'sentry', dsn: process.env.SENTRY_DSN },
            analytics: { enabled: false, service: 'google' },
            performanceMonitoring: { enabled: true, sampleRate: 1.0, slowQueryThreshold: 1000 }
          }
        }

      case 'development':
        return {
          security: {
            sessionTimeout: 86400000, // 24 hours
            maxLoginAttempts: 10,
            csrfEnabled: false,
            corsOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
            rateLimiting: {
              enabled: false,
              requestsPerMinute: 1000,
              burstLimit: 2000
            }
          },
          monitoring: {
            errorReporting: { enabled: false, service: 'sentry' },
            analytics: { enabled: false, service: 'google' },
            performanceMonitoring: { enabled: true, sampleRate: 1.0, slowQueryThreshold: 2000 }
          }
        }

      case 'test':
        return {
          database: {
            url: process.env.TEST_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
            anonKey: process.env.TEST_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            serviceRoleKey: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY,
            poolSize: 5,
            timeout: 10000,
            retryAttempts: 1
          },
          security: {
            sessionTimeout: 300000, // 5 minutes
            maxLoginAttempts: 3,
            csrfEnabled: false,
            corsOrigins: ['http://localhost:3000'],
            rateLimiting: {
              enabled: false,
              requestsPerMinute: 1000,
              burstLimit: 2000
            }
          },
          monitoring: {
            errorReporting: { enabled: false, service: 'sentry' },
            analytics: { enabled: false, service: 'google' },
            performanceMonitoring: { enabled: false, sampleRate: 0, slowQueryThreshold: 5000 }
          }
        }

      default:
        return {}
    }
  }
}

/**
 * Initialize and validate configuration
 */
function initializeConfig(): AppConfig {
  // Validate environment variables
  const envValidation = ConfigValidator.validateEnvironment()
  if (!envValidation.isValid) {
    const errorMessage = `Missing required environment variables: ${envValidation.missingVars.join(', ')}`
    // Use console.error to avoid circular dependency with logger
    console.error(`[ConfigManager] ${errorMessage}`, {
      component: 'ConfigManager',
      function: 'initializeConfig',
      metadata: { missingVars: envValidation.missingVars }
    })
    throw new Error(errorMessage)
  }

  // Create configuration
  const config = ConfigFactory.create()

  // Validate configuration
  const configValidation = ConfigValidator.validateConfig(config)
  if (!configValidation.isValid) {
    const errorMessage = `Invalid configuration: ${configValidation.errors.join(', ')}`
    // Use console.error to avoid circular dependency with logger
    console.error(`[ConfigManager] ${errorMessage}`, {
      component: 'ConfigManager',
      function: 'initializeConfig',
      metadata: { errors: configValidation.errors }
    })
    // Log but don't throw for non-critical config issues
  }

  // Log successful initialization
  console.info(`[ConfigManager] Configuration initialized successfully`, {
    component: 'ConfigManager',
    function: 'initializeConfig',
    metadata: {
      environment: config.environment,
      version: config.version,
      featuresEnabled: Object.entries(config.featureFlags)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature)
    }
  })

  return config
}

// Export singleton configuration instance
export const config = initializeConfig()

// Export utility functions
export const isProduction = () => config.environment === 'production'
export const isDevelopment = () => config.environment === 'development'
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => config.featureFlags[feature] as boolean
export const getEmailConfig = () => config.email
export const getSecurityConfig = () => config.security
export const getPerformanceConfig = () => config.performance

// Export for testing
export { ConfigValidator, ConfigFactory }