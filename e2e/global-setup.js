import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

async function globalSetup() {
  // Initialize Supabase client for test setup
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Create test data
  try {
    console.log('🧪 Setting up E2E test environment...')

    // Create test company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: 'test-company-e2e',
        name: 'E2E Test Company',
        created_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single()

    if (companyError && companyError.code !== '23505') { // Ignore duplicate key error
      throw companyError
    }

    // Create test user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: 'test-user-e2e',
        full_name: 'E2E Test User',
        email: 'e2e-test@buildledger.test',
        company_id: 'test-company-e2e',
        subscription_plan: 'Pro',
        created_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single()

    if (profileError && profileError.code !== '23505') {
      throw profileError
    }

    // Create test clients
    const testClients = [
      {
        id: 'test-client-residential',
        name: 'Residential Test Client',
        email: 'residential@test.com',
        phone: '+1234567890',
        address: '123 Test St, Test City, TC 12345',
        client_type: 'residential',
        company_id: 'test-company-e2e',
        created_at: new Date().toISOString()
      },
      {
        id: 'test-client-commercial',
        name: 'Commercial Test Client',
        email: 'commercial@test.com',
        phone: '+0987654321',
        address: '456 Business Ave, Test City, TC 12345',
        client_type: 'commercial',
        company_id: 'test-company-e2e',
        created_at: new Date().toISOString()
      }
    ]

    for (const client of testClients) {
      await supabase
        .from('clients')
        .upsert(client, { onConflict: 'id' })
    }

    // Create test quotes and invoices
    const testQuote = {
      id: 'test-quote-e2e',
      quote_number: 'QT-E2E-001',
      client_id: 'test-client-residential',
      company_id: 'test-company-e2e',
      description: 'E2E Test Quote - Website Development',
      total_amount: 5000.00,
      tax_amount: 450.00,
      status: 'draft',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    }

    await supabase
      .from('quotes')
      .upsert(testQuote, { onConflict: 'id' })

    const testInvoice = {
      id: 'test-invoice-e2e',
      invoice_number: 'INV-E2E-001',
      client_id: 'test-client-commercial',
      company_id: 'test-company-e2e',
      description: 'E2E Test Invoice - Consulting Services',
      total_amount: 2500.00,
      tax_amount: 225.00,
      status: 'draft',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    }

    await supabase
      .from('invoices')
      .upsert(testInvoice, { onConflict: 'id' })

    console.log('✅ E2E test environment setup complete')

  } catch (error) {
    console.error('❌ Failed to set up E2E test environment:', error)
    throw error
  }

  // Launch browser for authentication state setup
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Navigate to login page and set up authenticated state
    await page.goto('/login')
    
    // Mock authentication by setting local storage
    await page.evaluate(() => {
      const mockSession = {
        access_token: 'mock-access-token-e2e',
        refresh_token: 'mock-refresh-token-e2e',
        expires_at: Date.now() + 3600000,
        user: {
          id: 'test-user-e2e',
          email: 'e2e-test@buildledger.test',
          user_metadata: {
            full_name: 'E2E Test User'
          }
        }
      }
      
      localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession))
      localStorage.setItem('buildledger.auth.session', JSON.stringify({
        user: mockSession.user,
        authenticated: true,
        lastActivity: Date.now()
      }))
    })

    // Save authentication state
    await context.storageState({ path: './e2e/.auth/user.json' })
    console.log('✅ Authentication state saved')

  } finally {
    await browser.close()
  }
}

export default globalSetup