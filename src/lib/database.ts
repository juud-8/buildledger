/**
 * Database Service Layer
 * 
 * Comprehensive database abstraction with connection pooling, error handling,
 * query optimization, and robust data access patterns.
 * 
 * @author BuildLedger Team
 * @version 1.0.0
 */

import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js'
import { logger, logPerformance, ErrorCategory } from './logger'
import { config } from './config'
import { 
  BaseEntity, 
  Client, 
  Invoice, 
  Quote, 
  QueryOptions, 
  ApiResponse, 
  PaginatedResponse,
  SortConfig 
} from './types'

// Database operation types
export type DatabaseOperation = 'select' | 'insert' | 'update' | 'delete' | 'upsert'

// Query result types
export interface QueryResult<T = unknown> {
  data: T[] | null
  error: PostgrestError | null
  count?: number
}

export interface SingleQueryResult<T = unknown> {
  data: T | null
  error: PostgrestError | null
}

// Database configuration
interface DatabaseOptions {
  timeout?: number
  retryAttempts?: number
  enableCache?: boolean
  cacheTtl?: number
}

// Connection pool status
interface ConnectionPoolStatus {
  activeConnections: number
  idleConnections: number
  waitingConnections: number
  maxConnections: number
}

/**
 * Enhanced Supabase client with connection pooling and error handling
 */
class DatabaseService {
  private static instance: DatabaseService
  private client: SupabaseClient
  private connectionPool: Map<string, SupabaseClient> = new Map()
  private queryCache: Map<string, { data: unknown; timestamp: number }> = new Map()
  private readonly options: Required<DatabaseOptions>

  private constructor() {
    this.options = {
      timeout: config.database.timeout,
      retryAttempts: config.database.retryAttempts,
      enableCache: config.performance.cacheEnabled,
      cacheTtl: config.performance.cacheTtl * 1000 // Convert to milliseconds
    }

    this.client = this.createClient()
    this.initializeHealthCheck()
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  /**
   * Creates a new Supabase client with optimized configuration
   */
  private createClient(): SupabaseClient {
    return createClient(config.database.url, config.database.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'x-client-info': `buildledger-${config.version}`,
          'x-request-timeout': config.database.timeout.toString()
        }
      },
      db: {
        schema: 'public'
      }
    })
  }

  /**
   * Gets the primary database client
   */
  public getClient(): SupabaseClient {
    return this.client
  }

  /**
   * Executes a database query with error handling and performance monitoring
   */
  private async executeQuery<T>(
    operation: DatabaseOperation,
    table: string,
    queryFn: () => Promise<QueryResult<T> | SingleQueryResult<T>>,
    cacheKey?: string
  ): Promise<QueryResult<T> | SingleQueryResult<T>> {
    // Check cache first for read operations
    if (operation === 'select' && cacheKey && this.options.enableCache) {
      const cached = this.getCachedResult<T>(cacheKey)
      if (cached) {
        logger.debug('Cache hit for query', {
          component: 'Database',
          operation: 'cache_hit',
          metadata: { table, cacheKey }
        })
        return { data: cached as T[] | T, error: null }
      }
    }

    const endTimer = logPerformance(`database_${operation}_${table}`)
    let attempt = 0
    let lastError: PostgrestError | null = null

    while (attempt < this.options.retryAttempts) {
      try {
        const result = await Promise.race([
          queryFn(),
          this.timeoutPromise<QueryResult<T> | SingleQueryResult<T>>(this.options.timeout)
        ])

        // Cache successful read results
        if (operation === 'select' && result.data && !result.error && cacheKey && this.options.enableCache) {
          this.setCachedResult(cacheKey, result.data)
        }

        // Log successful operation
        logger.logDatabaseOperation(operation, table, !result.error, performance.now(), result.error)

        endTimer()
        return result

      } catch (error) {
        lastError = error as PostgrestError
        attempt++

        logger.warn(`Database ${operation} attempt ${attempt} failed`, {
          component: 'Database',
          operation,
          metadata: { 
            table, 
            attempt, 
            maxAttempts: this.options.retryAttempts,
            error: lastError?.message 
          }
        }, lastError)

        if (attempt < this.options.retryAttempts) {
          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 100)
        }
      }
    }

    // All attempts failed
    logger.error(`Database ${operation} failed after ${attempt} attempts`, {
      component: 'Database',
      operation,
      metadata: { table, finalAttempt: attempt }
    }, lastError)

    endTimer()
    return { data: null, error: lastError }
  }

  /**
   * Generic select method with pagination and filtering
   */
  public async select<T extends BaseEntity>(
    table: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const cacheKey = this.generateCacheKey('select', table, options)
    
    const result = await this.executeQuery<T>(
      'select',
      table,
      async () => {
        let query = this.client.from(table).select('*', { count: 'exact' })

        // Apply filters
        if (options.filters) {
          query = this.applyFilters(query, options.filters)
        }

        // Apply sorting
        if (options.sort) {
          query = query.order(options.sort.field, { ascending: options.sort.direction === 'asc' })
        }

        // Apply pagination
        const page = options.page || 1
        const limit = options.limit || 50
        const offset = (page - 1) * limit
        
        query = query.range(offset, offset + limit - 1)

        return await query
      },
      cacheKey
    )

    // Transform to paginated response
    const data = (result.data as T[]) || []
    const total = (result as QueryResult<T>).count || 0
    const limit = options.limit || 50
    const page = options.page || 1

    return {
      success: !result.error,
      data,
      error: result.error?.message,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1
      }
    }
  }

  /**
   * Generic select by ID method
   */
  public async selectById<T extends BaseEntity>(
    table: string,
    id: string,
    includes: string[] = []
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.generateCacheKey('selectById', table, { id, includes })
    
    const result = await this.executeQuery<T>(
      'select',
      table,
      async () => {
        let selectClause = '*'
        if (includes.length > 0) {
          selectClause = `*, ${includes.join(', ')}`
        }

        return await this.client
          .from(table)
          .select(selectClause)
          .eq('id', id)
          .single()
      },
      cacheKey
    )

    return {
      success: !result.error,
      data: result.data as T || undefined,
      error: result.error?.message,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generic insert method
   */
  public async insert<T extends Partial<BaseEntity>>(
    table: string,
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<T>> {
    // Clear relevant cache entries
    this.clearCacheByPattern(`select_${table}_`)

    const result = await this.executeQuery<T>(
      'insert',
      table,
      async () => {
        return await this.client
          .from(table)
          .insert(data)
          .select()
          .single()
      }
    )

    // Log business metric
    if (result.data && !result.error) {
      logger.logBusinessMetric(`${table}_created`, 1, { table })
    }

    return {
      success: !result.error,
      data: result.data as T || undefined,
      error: result.error?.message,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generic update method
   */
  public async update<T extends BaseEntity>(
    table: string,
    id: string,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<ApiResponse<T>> {
    // Clear relevant cache entries
    this.clearCacheByPattern(`select_${table}_`)

    const result = await this.executeQuery<T>(
      'update',
      table,
      async () => {
        return await this.client
          .from(table)
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
      }
    )

    return {
      success: !result.error,
      data: result.data as T || undefined,
      error: result.error?.message,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Generic delete method
   */
  public async delete(table: string, id: string): Promise<ApiResponse<void>> {
    // Clear relevant cache entries
    this.clearCacheByPattern(`select_${table}_`)

    const result = await this.executeQuery<void>(
      'delete',
      table,
      async () => {
        return await this.client
          .from(table)
          .delete()
          .eq('id', id)
      }
    )

    // Log business metric
    if (!result.error) {
      logger.logBusinessMetric(`${table}_deleted`, 1, { table })
    }

    return {
      success: !result.error,
      error: result.error?.message,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Executes a raw SQL query with proper error handling
   */
  public async executeRawQuery<T = unknown>(
    query: string,
    params: Record<string, unknown> = {}
  ): Promise<ApiResponse<T[]>> {
    const endTimer = logPerformance('database_raw_query')

    try {
      const { data, error } = await this.client.rpc('execute_query', {
        query_text: query,
        query_params: params
      })

      logger.debug('Raw query executed', {
        component: 'Database',
        operation: 'raw_query',
        metadata: { queryLength: query.length, paramCount: Object.keys(params).length }
      })

      endTimer()

      return {
        success: !error,
        data: data || [],
        error: error?.message,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      logger.error('Raw query execution failed', {
        component: 'Database',
        operation: 'raw_query'
      }, error as Error)

      endTimer()

      return {
        success: false,
        data: [],
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Batch operations for improved performance
   */
  public async batchInsert<T extends Partial<BaseEntity>>(
    table: string,
    items: Omit<T, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<ApiResponse<T[]>> {
    // Clear relevant cache entries
    this.clearCacheByPattern(`select_${table}_`)

    const result = await this.executeQuery<T[]>(
      'insert',
      table,
      async () => {
        return await this.client
          .from(table)
          .insert(items)
          .select()
      }
    )

    // Log business metric
    if (result.data && !result.error) {
      logger.logBusinessMetric(`${table}_batch_created`, (result.data as T[]).length, { table })
    }

    return {
      success: !result.error,
      data: result.data as T[] || [],
      error: result.error?.message,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Health check for database connection
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('profiles').select('count(*)').limit(1)
      return !error
    } catch {
      return false
    }
  }

  /**
   * Get connection pool status
   */
  public getConnectionPoolStatus(): ConnectionPoolStatus {
    return {
      activeConnections: this.connectionPool.size,
      idleConnections: 0, // Supabase handles this internally
      waitingConnections: 0, // Supabase handles this internally
      maxConnections: config.database.poolSize
    }
  }

  /**
   * Apply filters to a query
   */
  private applyFilters(query: any, filters: any): any {
    if (filters.query) {
      // Global search across text fields
      query = query.or(`name.ilike.%${filters.query}%,email.ilike.%${filters.query}%`)
    }

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end)
    }

    if (filters.amountRange) {
      query = query
        .gte('total', filters.amountRange.min)
        .lte('total', filters.amountRange.max)
    }

    return query
  }

  /**
   * Generate cache key for query results
   */
  private generateCacheKey(operation: string, table: string, options: unknown): string {
    const optionsHash = JSON.stringify(options)
    return `${operation}_${table}_${btoa(optionsHash)}`
  }

  /**
   * Get cached result if available and not expired
   */
  private getCachedResult<T>(key: string): T | null {
    const cached = this.queryCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.options.cacheTtl) {
      return cached.data as T
    }
    
    // Remove expired cache entry
    if (cached) {
      this.queryCache.delete(key)
    }
    
    return null
  }

  /**
   * Store result in cache
   */
  private setCachedResult(key: string, data: unknown): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now()
    })

    // Prevent cache from growing too large
    if (this.queryCache.size > 1000) {
      const oldestKey = this.queryCache.keys().next().value
      this.queryCache.delete(oldestKey)
    }
  }

  /**
   * Clear cache entries matching a pattern
   */
  private clearCacheByPattern(pattern: string): void {
    for (const key of this.queryCache.keys()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.queryCache.clear()
    logger.info('Database cache cleared', {
      component: 'Database',
      operation: 'cache_clear'
    })
  }

  /**
   * Timeout promise for query operations
   */
  private timeoutPromise<T>(ms: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), ms)
    })
  }

  /**
   * Delay utility for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Initialize periodic health checks
   */
  private initializeHealthCheck(): void {
    // Run health check every 5 minutes
    setInterval(async () => {
      const isHealthy = await this.healthCheck()
      if (!isHealthy) {
        logger.warn('Database health check failed', {
          component: 'Database',
          operation: 'health_check'
        })
      }
    }, 5 * 60 * 1000)
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance()

// Export specific database services for different entities
export class ClientService {
  static async getAll(options: QueryOptions = {}) {
    return db.select<Client>('clients', options)
  }

  static async getById(id: string) {
    return db.selectById<Client>('clients', id)
  }

  static async create(data: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    return db.insert<Client>('clients', data)
  }

  static async update(id: string, data: Partial<Client>) {
    return db.update<Client>('clients', id, data)
  }

  static async delete(id: string) {
    return db.delete('clients', id)
  }
}

export class InvoiceService {
  static async getAll(options: QueryOptions = {}) {
    return db.select<Invoice>('invoices', options)
  }

  static async getById(id: string) {
    return db.selectById<Invoice>('invoices', id, ['clients(*)', 'invoice_items(*)'])
  }

  static async create(data: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
    return db.insert<Invoice>('invoices', data)
  }

  static async update(id: string, data: Partial<Invoice>) {
    return db.update<Invoice>('invoices', id, data)
  }

  static async delete(id: string) {
    return db.delete('invoices', id)
  }

  static async markAsPaid(id: string) {
    return db.update<Invoice>('invoices', id, { 
      status: 'paid' as const,
      paid_date: new Date().toISOString()
    })
  }
}

export class QuoteService {
  static async getAll(options: QueryOptions = {}) {
    return db.select<Quote>('quotes', options)
  }

  static async getById(id: string) {
    return db.selectById<Quote>('quotes', id, ['clients(*)', 'quote_items(*)'])
  }

  static async create(data: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) {
    return db.insert<Quote>('quotes', data)
  }

  static async update(id: string, data: Partial<Quote>) {
    return db.update<Quote>('quotes', id, data)
  }

  static async delete(id: string) {
    return db.delete('quotes', id)
  }
}