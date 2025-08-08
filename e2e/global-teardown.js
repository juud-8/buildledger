import { createClient } from '@supabase/supabase-js'

async function globalTeardown() {
  // Initialize Supabase client for cleanup
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    console.log('🧹 Cleaning up E2E test data...')

    // Clean up in reverse dependency order
    const cleanupQueries = [
      // Delete quotes
      supabase.from('quotes').delete().eq('id', 'test-quote-e2e'),
      
      // Delete invoices
      supabase.from('invoices').delete().eq('id', 'test-invoice-e2e'),
      
      // Delete clients
      supabase.from('clients').delete().eq('company_id', 'test-company-e2e'),
      
      // Delete user profiles
      supabase.from('user_profiles').delete().eq('id', 'test-user-e2e'),
      
      // Delete companies
      supabase.from('companies').delete().eq('id', 'test-company-e2e')
    ]

    // Execute cleanup queries
    for (const query of cleanupQueries) {
      try {
        await query
      } catch (error) {
        // Log but don't fail on cleanup errors
        console.warn('Warning during cleanup:', error.message)
      }
    }

    console.log('✅ E2E test data cleanup complete')

  } catch (error) {
    console.error('❌ Failed to clean up E2E test data:', error)
    // Don't throw - cleanup failures shouldn't fail the build
  }
}

export default globalTeardown