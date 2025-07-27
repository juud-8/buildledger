/**
 * Database Test Suite
 * 
 * Comprehensive testing suite for validating database synchronization
 * between local codebase and live Supabase database.
 * 
 * @author BuildLedger Team
 * @version 1.0.0
 */

import { supabase } from './supabaseClient'
import { db } from './database'
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadLogo, 
  deleteLogo,
  createUserProfile,
  getUserStats,
  validateProfile
} from './profileService'
import { 
  ClientService, 
  InvoiceService, 
  QuoteService 
} from './database'
import { 
  Profile, 
  Client, 
  Invoice, 
  Quote, 
  PlanTier, 
  SubscriptionStatus,
  isProfile,
  isClient,
  isInvoice,
  isQuote
} from './types'
import { logger } from './logger'

// Test configuration
interface TestConfig {
  testUserId: string
  testClientId?: string
  testInvoiceId?: string
  testQuoteId?: string
  cleanupAfterTests: boolean
}

// Test results
interface TestResult {
  testName: string
  passed: boolean
  error?: string
  duration: number
  details?: Record<string, unknown>
}

interface TestSuiteResult {
  totalTests: number
  passedTests: number
  failedTests: number
  totalDuration: number
  results: TestResult[]
  summary: string
}

/**
 * Database Test Suite Class
 */
export class DatabaseTestSuite {
  private config: TestConfig
  private results: TestResult[] = []

  constructor(config: TestConfig) {
    this.config = config
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestSuiteResult> {
    const startTime = Date.now()
    this.results = []

    logger.info('Starting database test suite', {
      component: 'DatabaseTestSuite',
      operation: 'runAllTests',
      metadata: { testUserId: this.config.testUserId }
    })

    // Run test categories
    await this.runConnectionTests()
    await this.runProfileTests()
    await this.runClientTests()
    await this.runInvoiceTests()
    await this.runQuoteTests()
    await this.runLogoTests()
    await this.runUserManagementTests()
    await this.runDataIntegrityTests()
    await this.runPerformanceTests()

    // Cleanup if requested
    if (this.config.cleanupAfterTests) {
      await this.runCleanupTests()
    }

    const totalDuration = Date.now() - startTime
    const passedTests = this.results.filter(r => r.passed).length
    const failedTests = this.results.filter(r => !r.passed).length

    const summary = this.generateSummary(passedTests, failedTests, totalDuration)

    logger.info('Database test suite completed', {
      component: 'DatabaseTestSuite',
      operation: 'runAllTests',
      metadata: { 
        totalTests: this.results.length,
        passedTests,
        failedTests,
        totalDuration
      }
    })

    return {
      totalTests: this.results.length,
      passedTests,
      failedTests,
      totalDuration,
      results: this.results,
      summary
    }
  }

  /**
   * Test database connection and basic operations
   */
  private async runConnectionTests() {
    await this.runTest('Database Connection', async () => {
      const { error } = await supabase.from('profiles').select('count(*)').limit(1)
      if (error) throw new Error(`Connection failed: ${error.message}`)
      return { connected: true }
    })

    await this.runTest('Health Check', async () => {
      const isHealthy = await db.healthCheck()
      if (!isHealthy) throw new Error('Health check failed')
      return { healthy: true }
    })

    await this.runTest('RLS Policies Active', async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      // Should not return data without authentication
      if (!error && data && data.length > 0) {
        throw new Error('RLS policies not working correctly')
      }
      return { rlsActive: true }
    })
  }

  /**
   * Test profile operations
   */
  private async runProfileTests() {
    await this.runTest('Get User Profile', async () => {
      const { profile, error } = await getUserProfile(this.config.testUserId)
      if (error) throw new Error(`Failed to get profile: ${error}`)
      if (!profile) throw new Error('Profile not found')
      if (!isProfile(profile)) throw new Error('Invalid profile structure')
      
      return { 
        profileId: profile.id,
        planTier: profile.plan_tier,
        subscriptionStatus: profile.subscription_status
      }
    })

    await this.runTest('Update User Profile', async () => {
      const testData = {
        name: 'Test User Updated',
        company_name: 'Test Company Updated',
        default_payment_terms: 45
      }

      const { success, error } = await updateUserProfile(this.config.testUserId, testData)
      if (!success) throw new Error(`Failed to update profile: ${error}`)

      // Verify update
      const { profile } = await getUserProfile(this.config.testUserId, true)
      if (!profile) throw new Error('Profile not found after update')
      if (profile.name !== testData.name) throw new Error('Name not updated correctly')

      return { updated: true, newName: profile.name }
    })

    await this.runTest('Profile Validation', async () => {
      const validProfile = {
        name: 'Valid Name',
        company_name: 'Valid Company',
        plan_tier: 'pro' as PlanTier
      }

      const invalidProfile = {
        name: 'A'.repeat(101), // Too long
        plan_tier: 'invalid' as PlanTier
      }

      const validResult = validateProfile(validProfile)
      const invalidResult = validateProfile(invalidProfile)

      if (!validResult.valid) throw new Error('Valid profile failed validation')
      if (invalidResult.valid) throw new Error('Invalid profile passed validation')

      return { 
        validProfilePassed: validResult.valid,
        invalidProfileFailed: !invalidResult.valid,
        validationErrors: invalidResult.errors
      }
    })
  }

  /**
   * Test client operations
   */
  private async runClientTests() {
    await this.runTest('Create Client', async () => {
      const clientData = {
        user_id: this.config.testUserId,
        name: 'Test Client',
        email: 'test@client.com',
        phone: '+1234567890',
        address: '123 Test St, Test City, TC 12345',
        notes: 'Test client for database validation',
        tags: ['test', 'validation'],
        contact_person: 'John Doe',
        website: 'https://testclient.com',
        industry: 'Technology',
        payment_terms: 30,
        tax_exempt: false
      }

      const result = await ClientService.create(clientData)
      if (!result.success) throw new Error(`Failed to create client: ${result.error}`)
      if (!result.data) throw new Error('No client data returned')

      this.config.testClientId = result.data.id

      return { 
        clientId: result.data.id,
        clientName: result.data.name
      }
    })

    if (this.config.testClientId) {
      await this.runTest('Get Client by ID', async () => {
        const result = await ClientService.getById(this.config.testClientId!)
        if (!result.success) throw new Error(`Failed to get client: ${result.error}`)
        if (!result.data) throw new Error('No client data returned')
        if (!isClient(result.data)) throw new Error('Invalid client structure')

        return { 
          clientId: result.data.id,
          clientName: result.data.name,
          tags: result.data.tags
        }
      })

      await this.runTest('Update Client', async () => {
        const updateData = {
          name: 'Updated Test Client',
          notes: 'Updated test notes',
          tags: ['updated', 'test']
        }

        const result = await ClientService.update(this.config.testClientId!, updateData)
        if (!result.success) throw new Error(`Failed to update client: ${result.error}`)

        return { updated: true, newName: updateData.name }
      })
    }
  }

  /**
   * Test invoice operations
   */
  private async runInvoiceTests() {
    if (this.config.testClientId) {
      await this.runTest('Create Invoice', async () => {
        const invoiceData = {
          user_id: this.config.testUserId,
          client_id: this.config.testClientId,
          status: 'draft' as const,
          total: 1000.00,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: 'Test invoice for database validation',
          invoice_number: 'INV-001'
        }

        const result = await InvoiceService.create(invoiceData)
        if (!result.success) throw new Error(`Failed to create invoice: ${result.error}`)
        if (!result.data) throw new Error('No invoice data returned')

        this.config.testInvoiceId = result.data.id

        return { 
          invoiceId: result.data.id,
          invoiceNumber: result.data.invoice_number,
          total: result.data.total
        }
      })

      if (this.config.testInvoiceId) {
        await this.runTest('Get Invoice by ID', async () => {
          const result = await InvoiceService.getById(this.config.testInvoiceId!)
          if (!result.success) throw new Error(`Failed to get invoice: ${result.error}`)
          if (!result.data) throw new Error('No invoice data returned')
          if (!isInvoice(result.data)) throw new Error('Invalid invoice structure')

          return { 
            invoiceId: result.data.id,
            status: result.data.status,
            total: result.data.total
          }
        })

        await this.runTest('Mark Invoice as Paid', async () => {
          const result = await InvoiceService.markAsPaid(this.config.testInvoiceId!)
          if (!result.success) throw new Error(`Failed to mark invoice as paid: ${result.error}`)

          return { markedAsPaid: true }
        })
      }
    }
  }

  /**
   * Test quote operations
   */
  private async runQuoteTests() {
    if (this.config.testClientId) {
      await this.runTest('Create Quote', async () => {
        const quoteData = {
          user_id: this.config.testUserId,
          client_id: this.config.testClientId,
          title: 'Test Quote',
          status: 'draft' as const,
          total: 500.00,
          notes: 'Test quote for database validation'
        }

        const result = await QuoteService.create(quoteData)
        if (!result.success) throw new Error(`Failed to create quote: ${result.error}`)
        if (!result.data) throw new Error('No quote data returned')

        this.config.testQuoteId = result.data.id

        return { 
          quoteId: result.data.id,
          title: result.data.title,
          total: result.data.total
        }
      })

      if (this.config.testQuoteId) {
        await this.runTest('Get Quote by ID', async () => {
          const result = await QuoteService.getById(this.config.testQuoteId!)
          if (!result.success) throw new Error(`Failed to get quote: ${result.error}`)
          if (!result.data) throw new Error('No quote data returned')
          if (!isQuote(result.data)) throw new Error('Invalid quote structure')

          return { 
            quoteId: result.data.id,
            status: result.data.status,
            total: result.data.total
          }
        })
      }
    }
  }

  /**
   * Test logo operations
   */
  private async runLogoTests() {
    await this.runTest('Logo Upload Validation', async () => {
      // Create a mock file for testing
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      const result = await uploadLogo(this.config.testUserId, mockFile)
      if (result.success) throw new Error('Should have rejected invalid file type')

      return { 
        validationWorking: true,
        rejectedInvalidType: !result.success
      }
    })

    await this.runTest('Logo URL Retrieval', async () => {
      const { profile } = await getUserProfile(this.config.testUserId)
      if (!profile) throw new Error('Profile not found')

      // Test with existing logo URL
      if (profile.logo_url) {
        const logoUrl = await supabase.rpc('get_logo_url', { 
          user_id: this.config.testUserId 
        })
        
        if (logoUrl.error) throw new Error(`Failed to get logo URL: ${logoUrl.error.message}`)
        
        return { 
          logoUrlRetrieved: true,
          logoUrl: logoUrl.data
        }
      }

      return { noLogoToTest: true }
    })
  }

  /**
   * Test user management
   */
  private async runUserManagementTests() {
    await this.runTest('User Profile Creation', async () => {
      const testUserData = {
        name: 'Test User Creation',
        email: 'testcreation@example.com'
      }

      const result = await createUserProfile(this.config.testUserId, testUserData)
      if (!result.success) throw new Error(`Failed to create user profile: ${result.error}`)

      return { profileCreated: true }
    })

    await this.runTest('User Statistics', async () => {
      const result = await getUserStats(this.config.testUserId)
      if (!result.success) throw new Error(`Failed to get user stats: ${result.error}`)
      if (!result.data) throw new Error('No user stats returned')

      return { 
        totalClients: result.data.totalClients,
        totalInvoices: result.data.totalInvoices,
        totalQuotes: result.data.totalQuotes,
        totalRevenue: result.data.totalRevenue
      }
    })
  }

  /**
   * Test data integrity
   */
  private async runDataIntegrityTests() {
    await this.runTest('Foreign Key Constraints', async () => {
      // Test that clients reference valid users
      const { data: clients, error } = await supabase
        .from('clients')
        .select('user_id')
        .eq('user_id', this.config.testUserId)

      if (error) throw new Error(`Failed to query clients: ${error.message}`)

      // Verify all clients belong to valid users
      for (const client of clients || []) {
        const { data: user } = await supabase.auth.admin.getUserById(client.user_id)
        if (!user.user) throw new Error(`Client references invalid user: ${client.user_id}`)
      }

      return { 
        foreignKeyIntegrity: true,
        clientCount: clients?.length || 0
      }
    })

    await this.runTest('Data Type Validation', async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.config.testUserId)
        .single()

      if (error) throw new Error(`Failed to query profile: ${error.message}`)
      if (!profiles) throw new Error('Profile not found')

      // Validate data types
      if (typeof profiles.plan_tier !== 'string') throw new Error('plan_tier is not a string')
      if (typeof profiles.subscription_status !== 'string') throw new Error('subscription_status is not a string')
      if (profiles.default_payment_terms && typeof profiles.default_payment_terms !== 'number') {
        throw new Error('default_payment_terms is not a number')
      }

      return { 
        dataTypesValid: true,
        planTier: profiles.plan_tier,
        subscriptionStatus: profiles.subscription_status
      }
    })
  }

  /**
   * Test performance
   */
  private async runPerformanceTests() {
    await this.runTest('Query Performance', async () => {
      const startTime = Date.now()
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.config.testUserId)
        .single()

      const duration = Date.now() - startTime

      if (error) throw new Error(`Query failed: ${error.message}`)
      if (duration > 1000) throw new Error(`Query too slow: ${duration}ms`)

      return { 
        queryDuration: duration,
        performanceAcceptable: duration < 1000
      }
    })

    await this.runTest('Batch Operations', async () => {
      const testClients = Array.from({ length: 5 }, (_, i) => ({
        user_id: this.config.testUserId,
        name: `Batch Test Client ${i + 1}`,
        email: `batch${i + 1}@test.com`,
        notes: `Batch test client ${i + 1}`
      }))

      const startTime = Date.now()
      const result = await db.batchInsert('clients', testClients)
      const duration = Date.now() - startTime

      if (!result.success) throw new Error(`Batch insert failed: ${result.error}`)
      if (duration > 2000) throw new Error(`Batch operation too slow: ${duration}ms`)

      return { 
        batchDuration: duration,
        insertedCount: result.data?.length || 0,
        performanceAcceptable: duration < 2000
      }
    })
  }

  /**
   * Cleanup test data
   */
  private async runCleanupTests() {
    await this.runTest('Cleanup Test Data', async () => {
      const cleanupPromises = []

      // Cleanup invoices
      if (this.config.testInvoiceId) {
        cleanupPromises.push(InvoiceService.delete(this.config.testInvoiceId!))
      }

      // Cleanup quotes
      if (this.config.testQuoteId) {
        cleanupPromises.push(QuoteService.delete(this.config.testQuoteId!))
      }

      // Cleanup clients
      if (this.config.testClientId) {
        cleanupPromises.push(ClientService.delete(this.config.testClientId!))
      }

      // Wait for all cleanup operations
      const results = await Promise.all(cleanupPromises)
      const failedCleanups = results.filter(r => !r.success)

      if (failedCleanups.length > 0) {
        throw new Error(`Failed to cleanup: ${failedCleanups.map(r => r.error).join(', ')}`)
      }

      return { 
        cleanupSuccessful: true,
        cleanedItems: results.length
      }
    })
  }

  /**
   * Run a single test
   */
  private async runTest(testName: string, testFn: () => Promise<Record<string, unknown>>): Promise<void> {
    const startTime = Date.now()
    let passed = false
    let error: string | undefined
    let details: Record<string, unknown> | undefined

    try {
      details = await testFn()
      passed = true
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error'
      logger.error(`Test failed: ${testName}`, {
        component: 'DatabaseTestSuite',
        operation: 'runTest',
        metadata: { testName, error }
      }, err as Error)
    }

    const duration = Date.now() - startTime

    this.results.push({
      testName,
      passed,
      error,
      duration,
      details
    })

    logger.info(`Test ${passed ? 'passed' : 'failed'}: ${testName}`, {
      component: 'DatabaseTestSuite',
      operation: 'runTest',
      metadata: { 
        testName, 
        passed, 
        duration,
        error: error || undefined
      }
    })
  }

  /**
   * Generate test summary
   */
  private generateSummary(passedTests: number, failedTests: number, totalDuration: number): string {
    const successRate = ((passedTests / this.results.length) * 100).toFixed(1)
    
    return `
Database Test Suite Results
===========================
Total Tests: ${this.results.length}
Passed: ${passedTests}
Failed: ${failedTests}
Success Rate: ${successRate}%
Total Duration: ${totalDuration}ms

${failedTests > 0 ? 'Failed Tests:' : 'All tests passed!'}
${this.results
  .filter(r => !r.passed)
  .map(r => `- ${r.testName}: ${r.error}`)
  .join('\n')}
    `.trim()
  }

  /**
   * Get detailed test results
   */
  getResults(): TestResult[] {
    return this.results
  }

  /**
   * Export results to JSON
   */
  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      config: this.config,
      results: this.results
    }, null, 2)
  }
}

/**
 * Convenience function to run the test suite
 */
export async function runDatabaseTests(testUserId: string, cleanupAfterTests = true): Promise<TestSuiteResult> {
  const testSuite = new DatabaseTestSuite({
    testUserId,
    cleanupAfterTests
  })

  return await testSuite.runAllTests()
}

/**
 * Quick health check function
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('count(*)').limit(1)
    return !error
  } catch {
    return false
  }
} 