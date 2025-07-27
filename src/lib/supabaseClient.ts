/**
 * Supabase Client Configuration
 * 
 * Enhanced Supabase client with optimized settings for production use.
 * Includes proper authentication, performance optimizations, and monitoring.
 * 
 * @author BuildLedger Team
 * @version 1.0.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from './logger'
import { config, isProduction } from './config'

// Custom database schema type - matches live Supabase database structure
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          company_name: string | null
          logo_url: string | null
          plan_tier: 'free' | 'pro' | 'business'
          default_payment_terms: number | null
          default_tax_rate: number | null
          business_address: string | null
          business_phone: string | null
          business_email: string | null
          settings: any | null
          subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          name?: string | null
          company_name?: string | null
          logo_url?: string | null
          plan_tier?: 'free' | 'pro' | 'business'
          default_payment_terms?: number | null
          default_tax_rate?: number | null
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          settings?: any | null
          subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          company_name?: string | null
          logo_url?: string | null
          plan_tier?: 'free' | 'pro' | 'business'
          default_payment_terms?: number | null
          default_tax_rate?: number | null
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          settings?: any | null
          subscription_status?: 'active' | 'cancelled' | 'past_due' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          tags: string[] | null
          contact_person: string | null
          website: string | null
          industry: string | null
          total_invoiced: number | null
          total_paid: number | null
          last_invoice_date: string | null
          payment_terms: number | null
          tax_exempt: boolean | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          tags?: string[] | null
          contact_person?: string | null
          website?: string | null
          industry?: string | null
          total_invoiced?: number | null
          total_paid?: number | null
          last_invoice_date?: string | null
          payment_terms?: number | null
          tax_exempt?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          tags?: string[] | null
          contact_person?: string | null
          website?: string | null
          industry?: string | null
          total_invoiced?: number | null
          total_paid?: number | null
          last_invoice_date?: string | null
          payment_terms?: number | null
          tax_exempt?: boolean | null
          created_at?: string
          updated_at?: string | null
        }
      }
      quotes: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          title: string
          status: string
          total: number
          pdf_url: string | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          title: string
          status?: string
          total?: number
          pdf_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          title?: string
          status?: string
          total?: number
          pdf_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      quote_items: {
        Row: {
          id: string
          quote_id: string | null
          description: string
          quantity: number
          rate: number
        }
        Insert: {
          id?: string
          quote_id?: string | null
          description: string
          quantity?: number
          rate: number
        }
        Update: {
          id?: string
          quote_id?: string | null
          description?: string
          quantity?: number
          rate?: number
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          quote_id: string | null
          status: string
          due_date: string | null
          total: number
          pdf_url: string | null
          notes: string | null
          invoice_number: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          quote_id?: string | null
          status?: string
          due_date?: string | null
          total?: number
          pdf_url?: string | null
          notes?: string | null
          invoice_number?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          quote_id?: string | null
          status?: string
          due_date?: string | null
          total?: number
          pdf_url?: string | null
          notes?: string | null
          invoice_number?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string | null
          description: string
          quantity: number
          rate: number
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          description: string
          quantity?: number
          rate: number
        }
        Update: {
          id?: string
          invoice_id?: string | null
          description?: string
          quantity?: number
          rate?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_logo_url: {
        Args: {
          user_id: string
          filename?: string
        }
        Returns: string | null
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

/**
 * Create optimized Supabase client
 */
function createOptimizedSupabaseClient(): SupabaseClient<Database> {
  const client = createClient<Database>(
    config.database.url,
    config.database.anonKey,
    {
      auth: {
        // Enable automatic session refresh
        autoRefreshToken: true,
        // Persist session in localStorage
        persistSession: true,
        // Detect session from URL (for email confirmations, etc.)
        detectSessionInUrl: true,
        // Set session timeout
        storageKey: 'buildledger-auth-token',
        // Custom headers for auth requests
        headers: {
          'x-client-info': `buildledger-${config.version}`,
          'x-environment': config.environment
        }
      },
      global: {
        // Custom headers for all requests
        headers: {
          'x-client-version': config.version,
          'x-client-environment': config.environment,
          'x-request-timeout': config.database.timeout.toString()
        },
        // Only log in development
        fetch: isProduction() ? undefined : (url, options = {}) => {
          logger.debug('Supabase request', {
            component: 'SupabaseClient',
            operation: 'fetch',
            metadata: { 
              url: url.toString(),
              method: options.method || 'GET'
            }
          })
          return fetch(url, options)
        }
      },
      db: {
        // Use public schema
        schema: 'public'
      },
      // Real-time configuration
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  )

  // Add error handling for auth state changes
  client.auth.onAuthStateChange((event, session) => {
    logger.info(`Auth state changed: ${event}`, {
      component: 'SupabaseClient',
      operation: 'auth_state_change',
      metadata: { 
        event,
        hasSession: !!session,
        userId: session?.user?.id
      }
    })

    // Log user context for better debugging
    if (session?.user) {
      logger.setUserContext(session.user.id)
    }

    // Handle auth errors
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      // Clear any client-side caches
      if (typeof window !== 'undefined') {
        // Clear relevant localStorage items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('buildledger-cache-')) {
            localStorage.removeItem(key)
          }
        })
      }
    }
  })

  return client
}

/**
 * Enhanced Supabase client with additional utilities
 */
class SupabaseService {
  private static instance: SupabaseService
  private client: SupabaseClient<Database>

  private constructor() {
    this.client = createOptimizedSupabaseClient()
    this.initializeHealthCheck()
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  public getClient(): SupabaseClient<Database> {
    return this.client
  }

  /**
   * Get current user with error handling
   */
  public async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.client.auth.getUser()
      
      if (error) {
        logger.warn('Failed to get current user', {
          component: 'SupabaseService',
          operation: 'getCurrentUser'
        }, error)
        return { user: null, error }
      }

      return { user, error: null }
    } catch (error) {
      logger.error('Unexpected error getting current user', {
        component: 'SupabaseService',
        operation: 'getCurrentUser'
      }, error as Error)
      return { user: null, error: error as Error }
    }
  }

  /**
   * Sign out with proper cleanup
   */
  public async signOut() {
    try {
      const { error } = await this.client.auth.signOut()
      
      if (error) {
        logger.warn('Sign out failed', {
          component: 'SupabaseService',
          operation: 'signOut'
        }, error)
        return { error }
      }

      logger.info('User signed out successfully', {
        component: 'SupabaseService',
        operation: 'signOut'
      })

      return { error: null }
    } catch (error) {
      logger.error('Unexpected error during sign out', {
        component: 'SupabaseService',
        operation: 'signOut'
      }, error as Error)
      return { error: error as Error }
    }
  }

  /**
   * Health check for Supabase connection
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('profiles')
        .select('count(*)')
        .limit(1)

      return !error
    } catch {
      return false
    }
  }

  /**
   * Initialize periodic health checks
   */
  private initializeHealthCheck(): void {
    if (isProduction()) {
      // Run health check every 2 minutes in production
      setInterval(async () => {
        const isHealthy = await this.healthCheck()
        if (!isHealthy) {
          logger.warn('Supabase health check failed', {
            component: 'SupabaseService',
            operation: 'health_check'
          })
        }
      }, 2 * 60 * 1000)
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): {
    connected: boolean
    authenticated: boolean
    userId?: string
  } {
    const session = this.client.auth.getSession()
    return {
      connected: true, // Supabase doesn't expose connection status directly
      authenticated: !!session,
      userId: session ? undefined : undefined // Will be populated from actual session
    }
  }
}

// Export singleton instance and client
export const supabaseService = SupabaseService.getInstance()
export const supabase = supabaseService.getClient()

// Export types for use in other files
export type { Database }