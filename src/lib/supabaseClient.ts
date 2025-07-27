import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'
import { logger } from './logger'

/**
 * Environment variable validation
 * Throws descriptive errors if required environment variables are missing
 */
const validateEnvironment = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not defined. Please check your environment variables.'
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined. Please check your environment variables.'
    )
  }

  return { supabaseUrl, supabaseAnonKey }
}

/**
 * Create and configure Supabase client with production-ready settings
 */
const createSupabaseClient = (): SupabaseClient<Database> => {
  try {
    const { supabaseUrl, supabaseAnonKey } = validateEnvironment()

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Auto-refresh tokens
        autoRefreshToken: true,
        // Persist session in localStorage
        persistSession: true,
        // Detect session in URL (for magic links)
        detectSessionInUrl: true,
      },
      // Global error handling
      global: {
        headers: {
          'X-Client-Info': 'buildledger-web',
        },
      },
      // Real-time configuration
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  } catch (error) {
    logger.error('Failed to create Supabase client:', error)
    throw error
  }
}

/**
 * Main Supabase client instance
 * Use this throughout the application for database operations
 */
export const supabase = createSupabaseClient()

/**
 * Server-side Supabase client with service role key
 * Use this only in API routes and server-side operations
 */
export const createServerSupabaseClient = (): SupabaseClient<Database> => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not defined. This is required for server-side operations.'
    )
  }

  const { supabaseUrl } = validateEnvironment()

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Type-safe database client
 * This provides better TypeScript support for database operations
 */
export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Utility function to check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  try {
    validateEnvironment()
    return true
  } catch {
    return false
  }
}