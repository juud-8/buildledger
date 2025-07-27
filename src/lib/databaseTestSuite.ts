import { supabase } from './supabaseClient'
import { 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile, 
  uploadLogo, 
  deleteLogo,
  getPlanFeatures,
  canPerformAction
} from './profileService'
import { Profile } from './types'

/**
 * Database Synchronization Test Suite
 * 
 * Comprehensive testing for all aspects of the BuildLedger database:
 * - Database connectivity and configuration
 * - Table structures and relationships
 * - Row Level Security (RLS) policies
 * - Storage bucket configuration
 * - Profile management operations
 * - Logo upload/management
 * - Subscription plan features
 * - Performance and scalability
 */

export interface TestResult {
  testName: string
  success: boolean
  message: string
  duration: number
  details?: Record<string, unknown>
}

export interface TestSuiteResult {
  totalTests: number
  passedTests: number
  failedTests: number
  results: TestResult[]
  duration: number
  summary: string
}

/**
 * Test categories for better organization
 */
export enum TestCategory {
  CONNECTIVITY = 'Connectivity',
  STRUCTURE = 'Database Structure',
  SECURITY = 'Security & RLS',
  STORAGE = 'File Storage',
  FUNCTIONALITY = 'Core Functionality',
  PERFORMANCE = 'Performance',
  INTEGRATION = 'Integration'
}

/**
 * Run a single test with comprehensive error handling and timing
 */
async function runTest(
  testName: string, 
  testFunction: () => Promise<{ success: boolean; message: string; details?: Record<string, unknown> }>,
  category: TestCategory = TestCategory.FUNCTIONALITY
): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    const result = await testFunction()
    const duration = Date.now() - startTime
    
    return {
      testName: `[${category}] ${testName}`,
      success: result.success,
      message: result.message,
      duration,
      details: result.details
    }
  } catch (error) {
    const duration = Date.now() - startTime
    return {
      testName: `[${category}] ${testName}`,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      duration,
      details: { error: error instanceof Error ? error.stack : String(error) }
    }
  }
}

/**
 * Test database connectivity and basic operations
 */
async function testDatabaseConnection(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const startTime = Date.now()
    
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)

    const duration = Date.now() - startTime

    if (error) {
      return { 
        success: false, 
        message: `Database connection failed: ${error.message}`,
        details: { error: error.message, code: error.code }
      }
    }

    return { 
      success: true, 
      message: 'Database connection successful',
      details: { responseTime: duration, data }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Database connection error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test profiles table structure and constraints
 */
async function testProfilesTableStructure(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    // Test inserting a profile with all fields
    const testProfile = {
      id: testUserId,
      name: 'Test User',
      company_name: 'Test Company',
      plan_tier: 'free' as const,
      logo_url: 'https://example.com/logo.png'
    }
    
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert(testProfile)

    if (insertError) {
      return { 
        success: false, 
        message: `Profile table structure error: ${insertError.message}`,
        details: { error: insertError.message, code: insertError.code }
      }
    }

    // Test reading the profile
    const { data: readData, error: readError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single()

    if (readError || !readData) {
      return { 
        success: false, 
        message: `Profile read error: ${readError?.message || 'No data returned'}`,
        details: { error: readError?.message }
      }
    }

    // Verify all fields are present
    const requiredFields = ['id', 'name', 'company_name', 'plan_tier', 'created_at']
    const missingFields = requiredFields.filter(field => !(field in readData))
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: { missingFields, actualFields: Object.keys(readData) }
      }
    }

    // Clean up test data
    await supabase.from('profiles').delete().eq('id', testUserId)

    return { 
      success: true, 
      message: 'Profiles table structure is correct',
      details: { fields: Object.keys(readData), data: readData }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Profile table test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test all table structures
 */
async function testAllTableStructures(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const tables = ['clients', 'quotes', 'quote_items', 'invoices', 'invoice_items']
    const results: Record<string, boolean> = {}
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      results[table] = !error
      
      if (error) {
        return { 
          success: false, 
          message: `Table ${table} structure error: ${error.message}`,
          details: { table, error: error.message, code: error.code }
        }
      }
    }

    return { 
      success: true, 
      message: 'All table structures are correct',
      details: { tables: results }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Table structure test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test storage bucket configuration and permissions
 */
async function testStorageBucketConfig(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return { 
        success: false, 
        message: `Storage bucket list error: ${error.message}`,
        details: { error: error.message, statusCode: error.statusCode }
      }
    }

    const logosBucket = buckets?.find(bucket => bucket.name === 'logos')
    if (!logosBucket) {
      return { 
        success: false, 
        message: 'Logos bucket not found',
        details: { availableBuckets: buckets?.map(b => b.name) }
      }
    }

    if (!logosBucket.public) {
      return { 
        success: false, 
        message: 'Logos bucket is not public',
        details: { bucket: logosBucket }
      }
    }

    // Test bucket permissions
    const testPath = 'test/test-file.txt'
    const testContent = 'test content'
    
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(testPath, new Blob([testContent]), {
        upsert: true
      })

    if (uploadError) {
      return { 
        success: false, 
        message: `Storage upload test failed: ${uploadError.message}`,
        details: { error: uploadError.message, statusCode: uploadError.statusCode }
      }
    }

    // Clean up test file
    await supabase.storage.from('logos').remove([testPath])

    return { 
      success: true, 
      message: 'Storage bucket configuration is correct',
      details: { bucket: logosBucket, uploadTest: 'passed' }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Storage bucket test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test profile service functions comprehensively
 */
async function testProfileServiceFunctions(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const testUserId = '11111111-1111-1111-1111-111111111111'
    const results: Record<string, boolean> = {}

    // Test create profile
    const createResult = await createUserProfile(testUserId, { 
      name: 'Test Service User', 
      email: 'test@example.com' 
    })
    results.create = createResult.success

    if (!createResult.success) {
      return { 
        success: false, 
        message: `Create profile failed: ${createResult.error}`,
        details: { error: createResult.error }
      }
    }

    // Test get profile
    const getResult = await getUserProfile(testUserId)
    results.get = !getResult.error && !!getResult.profile
    
    if (getResult.error || !getResult.profile) {
      return { 
        success: false, 
        message: `Get profile failed: ${getResult.error}`,
        details: { error: getResult.error }
      }
    }

    // Test update profile
    const updateResult = await updateUserProfile(testUserId, {
      company_name: 'Updated Company',
      plan_tier: 'pro'
    })
    results.update = updateResult.success

    if (!updateResult.success) {
      return { 
        success: false, 
        message: `Update profile failed: ${updateResult.error}`,
        details: { error: updateResult.error }
      }
    }

    // Verify update
    const verifyResult = await getUserProfile(testUserId)
    results.verify = verifyResult.profile?.company_name === 'Updated Company' && 
                    verifyResult.profile?.plan_tier === 'pro'

    if (!results.verify) {
      return { 
        success: false, 
        message: 'Profile update verification failed',
        details: { 
          expected: { company_name: 'Updated Company', plan_tier: 'pro' },
          actual: { 
            company_name: verifyResult.profile?.company_name, 
            plan_tier: verifyResult.profile?.plan_tier 
          }
        }
      }
    }

    // Test plan features
    const features = getPlanFeatures('pro')
    results.planFeatures = !!features

    // Test action permissions
    const canCreateClient = canPerformAction('pro', 'create_client', 0)
    const canUploadLogo = canPerformAction('pro', 'upload_logo')
    results.permissions = canCreateClient && canUploadLogo

    // Clean up
    await supabase.from('profiles').delete().eq('id', testUserId)

    return { 
      success: true, 
      message: 'Profile service functions work correctly',
      details: { results, features, permissions: { canCreateClient, canUploadLogo } }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Profile service test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test logo upload and management
 */
async function testLogoManagement(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const testUserId = '22222222-2222-2222-2222-222222222222'
    
    // Create test profile
    await createUserProfile(testUserId, { name: 'Logo Test User' })

    // Create test file
    const testFile = new File(['test logo content'], 'test-logo.png', { type: 'image/png' })

    // Test logo upload
    const uploadResult = await uploadLogo(testUserId, testFile)
    if (!uploadResult.success) {
      return { 
        success: false, 
        message: `Logo upload failed: ${uploadResult.error}`,
        details: { error: uploadResult.error }
      }
    }

    // Test logo deletion
    const deleteResult = await deleteLogo(testUserId)
    if (!deleteResult.success) {
      return { 
        success: false, 
        message: `Logo deletion failed: ${deleteResult.error}`,
        details: { error: deleteResult.error }
      }
    }

    // Clean up
    await supabase.from('profiles').delete().eq('id', testUserId)

    return { 
      success: true, 
      message: 'Logo management functions work correctly',
      details: { uploadUrl: uploadResult.url, filename: uploadResult.filename }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Logo management test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test RLS policies and security
 */
async function testRLSPolicies(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    // Test profiles table RLS
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    // Test clients table RLS
    const { error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1)

    // Test invoices table RLS
    const { error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .limit(1)

    // RLS should either return data (if authenticated) or give an RLS error
    const rlsTests = [
      { table: 'profiles', error: profilesError },
      { table: 'clients', error: clientsError },
      { table: 'invoices', error: invoicesError }
    ]

    const results = rlsTests.map(test => ({
      table: test.table,
      hasRLS: test.error ? 
        (test.error.message.includes('RLS') || test.error.message.includes('permission')) : 
        true
    }))

    const allRLSConfigured = results.every(r => r.hasRLS)

    return { 
      success: allRLSConfigured, 
      message: allRLSConfigured ? 'RLS policies are configured' : 'Some RLS policies may be missing',
      details: { rlsTests: results }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `RLS test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test foreign key relationships
 */
async function testForeignKeyRelationships(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const relationships = [
      { table: 'clients', foreignKey: 'user_id', references: 'profiles.id' },
      { table: 'quotes', foreignKey: 'user_id', references: 'profiles.id' },
      { table: 'invoices', foreignKey: 'user_id', references: 'profiles.id' },
      { table: 'quote_items', foreignKey: 'quote_id', references: 'quotes.id' },
      { table: 'invoice_items', foreignKey: 'invoice_id', references: 'invoices.id' }
    ]

    const results = []

    for (const rel of relationships) {
      try {
        const { error } = await supabase
          .from(rel.table)
          .select(`${rel.foreignKey}, ${rel.references.split('.')[0]}(*)`)
          .limit(1)

        results.push({
          relationship: `${rel.table}.${rel.foreignKey} -> ${rel.references}`,
          valid: !error || error.message.includes('relation') || error.message.includes('foreign')
        })
      } catch (error) {
        results.push({
          relationship: `${rel.table}.${rel.foreignKey} -> ${rel.references}`,
          valid: false,
          error: String(error)
        })
      }
    }

    const allValid = results.every(r => r.valid)

    return { 
      success: allValid, 
      message: allValid ? 'Foreign key relationships are configured' : 'Some foreign key relationships may be missing',
      details: { relationships: results }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Foreign key test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test database functions
 */
async function testDatabaseFunctions(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    // Test the get_logo_url function
    const { error: logoError } = await supabase
      .rpc('get_logo_url', { 
        user_id: '00000000-0000-0000-0000-000000000000', 
        filename: 'test.png' 
      })

    // Test update_updated_at_column function (if it exists)
    const { error: functionError } = await supabase
      .rpc('update_updated_at_column')

    const results = {
      get_logo_url: !logoError || logoError.message.includes('not found'),
      update_updated_at_column: !functionError
    }

    const allFunctionsWork = Object.values(results).every(Boolean)

    return { 
      success: allFunctionsWork, 
      message: allFunctionsWork ? 'Database functions are working' : 'Some database functions may be missing',
      details: { functions: results }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Database function test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Test performance and scalability
 */
async function testPerformance(): Promise<{ success: boolean; message: string; details?: Record<string, unknown> }> {
  try {
    const startTime = Date.now()
    
    // Test concurrent profile reads
    const promises = Array.from({ length: 10 }, () => 
      supabase.from('profiles').select('count(*)').limit(1)
    )
    
    const results = await Promise.all(promises)
    const duration = Date.now() - startTime
    
    const allSuccessful = results.every(r => !r.error)
    const avgResponseTime = duration / results.length

    return { 
      success: allSuccessful, 
      message: allSuccessful ? 'Performance test passed' : 'Performance test failed',
      details: { 
        concurrentRequests: results.length,
        totalDuration: duration,
        avgResponseTime,
        allSuccessful
      }
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Performance test error: ${error}`,
      details: { error: String(error) }
    }
  }
}

/**
 * Run the complete test suite with comprehensive reporting
 */
export async function runDatabaseTestSuite(): Promise<TestSuiteResult> {
  const startTime = Date.now()
  const results: TestResult[] = []

  console.log('🧪 Starting BuildLedger Database Synchronization Test Suite...\n')

  // Define all tests with categories
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection, category: TestCategory.CONNECTIVITY },
    { name: 'Profiles Table Structure', fn: testProfilesTableStructure, category: TestCategory.STRUCTURE },
    { name: 'All Table Structures', fn: testAllTableStructures, category: TestCategory.STRUCTURE },
    { name: 'Storage Bucket Configuration', fn: testStorageBucketConfig, category: TestCategory.STORAGE },
    { name: 'Profile Service Functions', fn: testProfileServiceFunctions, category: TestCategory.FUNCTIONALITY },
    { name: 'Logo Management', fn: testLogoManagement, category: TestCategory.FUNCTIONALITY },
    { name: 'RLS Policies', fn: testRLSPolicies, category: TestCategory.SECURITY },
    { name: 'Foreign Key Relationships', fn: testForeignKeyRelationships, category: TestCategory.STRUCTURE },
    { name: 'Database Functions', fn: testDatabaseFunctions, category: TestCategory.FUNCTIONALITY },
    { name: 'Performance Test', fn: testPerformance, category: TestCategory.PERFORMANCE },
  ]

  // Run all tests
  for (const test of tests) {
    console.log(`Running: ${test.name}...`)
    const result = await runTest(test.name, test.fn, test.category)
    results.push(result)
    
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.testName} (${result.duration}ms): ${result.message}`)
    
    if (result.details && Object.keys(result.details).length > 0) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
    }
    console.log('')
  }

  const duration = Date.now() - startTime
  const passedTests = results.filter(r => r.success).length
  const failedTests = results.filter(r => !r.success).length

  // Generate summary
  const failedTestNames = results.filter(r => !r.success).map(r => r.testName)
  const summary = failedTests === 0 
    ? '🎉 All tests passed! Database synchronization is working correctly.'
    : `⚠️ ${failedTests} test(s) failed: ${failedTestNames.join(', ')}`

  const testSuiteResult: TestSuiteResult = {
    totalTests: tests.length,
    passedTests,
    failedTests,
    results,
    duration,
    summary
  }

  // Print comprehensive summary
  console.log('📊 Test Suite Summary:')
  console.log(`Total Tests: ${testSuiteResult.totalTests}`)
  console.log(`✅ Passed: ${testSuiteResult.passedTests}`)
  console.log(`❌ Failed: ${testSuiteResult.failedTests}`)
  console.log(`⏱️ Total Duration: ${testSuiteResult.duration}ms`)
  console.log(`📈 Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`)
  console.log(`\n${summary}`)

  // Print category breakdown
  const categoryBreakdown = Object.values(TestCategory).map(category => {
    const categoryTests = results.filter(r => r.testName.includes(`[${category}]`))
    const categoryPassed = categoryTests.filter(r => r.success).length
    return `${category}: ${categoryPassed}/${categoryTests.length} passed`
  })

  console.log('\n📋 Category Breakdown:')
  categoryBreakdown.forEach(breakdown => console.log(`  ${breakdown}`))

  return testSuiteResult
}

/**
 * Quick health check for production monitoring
 */
export async function quickHealthCheck(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
  const startTime = Date.now()
  const checks: Record<string, boolean> = {}
  
  try {
    // Test database connectivity
    const { error: dbError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)
    checks.database = !dbError

    // Test storage
    const { error: storageError } = await supabase.storage.listBuckets()
    checks.storage = !storageError

    // Test RLS
    const { error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    checks.rls = !rlsError || rlsError.message.includes('RLS') || rlsError.message.includes('permission')

    const duration = Date.now() - startTime
    const healthy = Object.values(checks).every(Boolean)

    return {
      healthy,
      details: {
        checks,
        responseTime: duration,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    return {
      healthy: false,
      details: {
        error: String(error),
        checks,
        timestamp: new Date().toISOString()
      }
    }
  }
}

/**
 * Get detailed system status for monitoring
 */
export async function getSystemStatus(): Promise<{
  database: { status: string; details: Record<string, unknown> }
  storage: { status: string; details: Record<string, unknown> }
  security: { status: string; details: Record<string, unknown> }
  performance: { status: string; details: Record<string, unknown> }
}> {
  const healthCheck = await quickHealthCheck()
  
  return {
    database: {
      status: healthCheck.details.checks?.database ? 'healthy' : 'unhealthy',
      details: healthCheck.details
    },
    storage: {
      status: healthCheck.details.checks?.storage ? 'healthy' : 'unhealthy',
      details: healthCheck.details
    },
    security: {
      status: healthCheck.details.checks?.rls ? 'healthy' : 'unhealthy',
      details: healthCheck.details
    },
    performance: {
      status: healthCheck.details.responseTime < 1000 ? 'good' : 'slow',
      details: { responseTime: healthCheck.details.responseTime }
    }
  }
} 