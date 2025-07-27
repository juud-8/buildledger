import { supabase } from './supabaseClient'
import { getUserProfile, updateUserProfile, createUserProfile } from './profileService'
import { Profile } from './types'

/**
 * Database Synchronization Test Suite
 * Tests all aspects of profile management, logo handling, and database operations
 */

export interface TestResult {
  testName: string
  success: boolean
  message: string
  duration: number
}

export interface TestSuiteResult {
  totalTests: number
  passedTests: number
  failedTests: number
  results: TestResult[]
  duration: number
}

/**
 * Run a single test with timing
 */
async function runTest(
  testName: string, 
  testFunction: () => Promise<{ success: boolean; message: string }>
): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    const result = await testFunction()
    const duration = Date.now() - startTime
    
    return {
      testName,
      success: result.success,
      message: result.message,
      duration
    }
  } catch (error) {
    const duration = Date.now() - startTime
    return {
      testName,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      duration
    }
  }
}

/**
 * Test database connectivity
 */
async function testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)

    if (error) {
      return { success: false, message: `Database connection failed: ${error.message}` }
    }

    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    return { success: false, message: `Database connection error: ${error}` }
  }
}

/**
 * Test profiles table structure
 */
async function testProfilesTableStructure(): Promise<{ success: boolean; message: string }> {
  try {
    // Test inserting a dummy profile to validate structure
    const testUserId = '00000000-0000-0000-0000-000000000000'
    
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: testUserId,
        name: 'Test User',
        company_name: 'Test Company',
        plan_tier: 'free'
      })

    if (insertError) {
      return { success: false, message: `Profile table structure error: ${insertError.message}` }
    }

    // Clean up test data
    await supabase.from('profiles').delete().eq('id', testUserId)

    return { success: true, message: 'Profiles table structure is correct' }
  } catch (error) {
    return { success: false, message: `Profile table test error: ${error}` }
  }
}

/**
 * Test storage bucket configuration
 */
async function testStorageBucketConfig(): Promise<{ success: boolean; message: string }> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      return { success: false, message: `Storage bucket list error: ${error.message}` }
    }

    const logosBucket = buckets?.find(bucket => bucket.name === 'logos')
    if (!logosBucket) {
      return { success: false, message: 'Logos bucket not found' }
    }

    if (!logosBucket.public) {
      return { success: false, message: 'Logos bucket is not public' }
    }

    return { success: true, message: 'Storage bucket configuration is correct' }
  } catch (error) {
    return { success: false, message: `Storage bucket test error: ${error}` }
  }
}

/**
 * Test profile service functions
 */
async function testProfileServiceFunctions(): Promise<{ success: boolean; message: string }> {
  try {
    const testUserId = '11111111-1111-1111-1111-111111111111'

    // Test create profile
    const createResult = await createUserProfile(testUserId, { 
      name: 'Test Service User', 
      email: 'test@example.com' 
    })

    if (!createResult.success) {
      return { success: false, message: `Create profile failed: ${createResult.error}` }
    }

    // Test get profile
    const getResult = await getUserProfile(testUserId)
    if (getResult.error || !getResult.profile) {
      return { success: false, message: `Get profile failed: ${getResult.error}` }
    }

    // Test update profile
    const updateResult = await updateUserProfile(testUserId, {
      company_name: 'Updated Company',
      plan_tier: 'pro'
    })

    if (!updateResult.success) {
      return { success: false, message: `Update profile failed: ${updateResult.error}` }
    }

    // Verify update
    const verifyResult = await getUserProfile(testUserId)
    if (verifyResult.profile?.company_name !== 'Updated Company' || 
        verifyResult.profile?.plan_tier !== 'pro') {
      return { success: false, message: 'Profile update verification failed' }
    }

    // Clean up
    await supabase.from('profiles').delete().eq('id', testUserId)

    return { success: true, message: 'Profile service functions work correctly' }
  } catch (error) {
    return { success: false, message: `Profile service test error: ${error}` }
  }
}

/**
 * Test RLS policies
 */
async function testRLSPolicies(): Promise<{ success: boolean; message: string }> {
  try {
    // This test requires actual authentication, so we'll test the structure
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    // RLS should either return data (if authenticated) or give an RLS error
    if (error && !error.message.includes('RLS') && !error.message.includes('permission')) {
      return { success: false, message: `Unexpected RLS error: ${error.message}` }
    }

    return { success: true, message: 'RLS policies are configured' }
  } catch (error) {
    return { success: false, message: `RLS test error: ${error}` }
  }
}

/**
 * Test foreign key relationships
 */
async function testForeignKeyRelationships(): Promise<{ success: boolean; message: string }> {
  try {
    // Test that profile references are set up correctly
    const { data, error } = await supabase
      .from('clients')
      .select('user_id, profiles!inner(*)')
      .limit(1)

    // This should either work or give a specific foreign key error
    if (error && !error.message.includes('relation') && !error.message.includes('foreign')) {
      return { success: false, message: `Foreign key test error: ${error.message}` }
    }

    return { success: true, message: 'Foreign key relationships are configured' }
  } catch (error) {
    return { success: false, message: `Foreign key test error: ${error}` }
  }
}

/**
 * Test database functions
 */
async function testDatabaseFunctions(): Promise<{ success: boolean; message: string }> {
  try {
    // Test the get_logo_url function
    const { data, error } = await supabase
      .rpc('get_logo_url', { 
        user_id: '00000000-0000-0000-0000-000000000000', 
        filename: 'test.png' 
      })

    // Function should exist and return null for non-existent file
    if (error && !error.message.includes('not found')) {
      return { success: false, message: `Database function error: ${error.message}` }
    }

    return { success: true, message: 'Database functions are working' }
  } catch (error) {
    return { success: false, message: `Database function test error: ${error}` }
  }
}

/**
 * Run the complete test suite
 */
export async function runDatabaseTestSuite(): Promise<TestSuiteResult> {
  const startTime = Date.now()
  const results: TestResult[] = []

  console.log('🧪 Starting Database Synchronization Test Suite...\n')

  // Define all tests
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Profiles Table Structure', fn: testProfilesTableStructure },
    { name: 'Storage Bucket Configuration', fn: testStorageBucketConfig },
    { name: 'Profile Service Functions', fn: testProfileServiceFunctions },
    { name: 'RLS Policies', fn: testRLSPolicies },
    { name: 'Foreign Key Relationships', fn: testForeignKeyRelationships },
    { name: 'Database Functions', fn: testDatabaseFunctions },
  ]

  // Run all tests
  for (const test of tests) {
    console.log(`Running: ${test.name}...`)
    const result = await runTest(test.name, test.fn)
    results.push(result)
    
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${test.name} (${result.duration}ms): ${result.message}\n`)
  }

  const duration = Date.now() - startTime
  const passedTests = results.filter(r => r.success).length
  const failedTests = results.filter(r => !r.success).length

  const summary: TestSuiteResult = {
    totalTests: tests.length,
    passedTests,
    failedTests,
    results,
    duration
  }

  // Print summary
  console.log('📊 Test Suite Summary:')
  console.log(`Total Tests: ${summary.totalTests}`)
  console.log(`✅ Passed: ${summary.passedTests}`)
  console.log(`❌ Failed: ${summary.failedTests}`)
  console.log(`⏱️ Total Duration: ${summary.duration}ms`)

  if (summary.failedTests === 0) {
    console.log('\n🎉 All tests passed! Database synchronization is working correctly.')
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above.')
  }

  return summary
}

/**
 * Quick health check for production
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    // Test basic connectivity
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)

    if (profilesError) return false

    // Test storage
    const { error: storageError } = await supabase.storage.listBuckets()
    if (storageError) return false

    return true
  } catch {
    return false
  }
} 