#!/usr/bin/env tsx

/**
 * Database Test Runner Script
 * 
 * Simple command-line script to run the database test suite
 * 
 * Usage: npm run test:database [userId]
 */

import { runDatabaseTests, quickHealthCheck } from '../src/lib/databaseTestSuite'
import { logger } from '../src/lib/logger'

async function main() {
  const userId = process.argv[2]
  
  if (!userId) {
    console.error('Usage: npm run test:database <userId>')
    console.error('Example: npm run test:database 123e4567-e89b-12d3-a456-426614174000')
    process.exit(1)
  }

  console.log('🔍 BuildLedger Database Test Suite')
  console.log('====================================')
  console.log(`Testing with user ID: ${userId}`)
  console.log('')

  try {
    // Quick health check first
    console.log('🏥 Running health check...')
    const isHealthy = await quickHealthCheck()
    
    if (!isHealthy) {
      console.error('❌ Database health check failed')
      console.error('Please check your database connection and try again')
      process.exit(1)
    }
    
    console.log('✅ Database connection healthy')
    console.log('')

    // Run full test suite
    console.log('🧪 Running comprehensive test suite...')
    const startTime = Date.now()
    
    const results = await runDatabaseTests(userId, true)
    
    const duration = Date.now() - startTime
    
    console.log('')
    console.log('📊 Test Results')
    console.log('===============')
    console.log(`Total Tests: ${results.totalTests}`)
    console.log(`Passed: ${results.passedTests}`)
    console.log(`Failed: ${results.failedTests}`)
    console.log(`Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`)
    console.log(`Duration: ${duration}ms`)
    console.log('')

    // Display detailed results
    if (results.failedTests > 0) {
      console.log('❌ Failed Tests:')
      results.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.testName}: ${r.error}`)
        })
      console.log('')
    }

    // Display summary
    console.log('📋 Summary')
    console.log('==========')
    console.log(results.summary)
    console.log('')

    // Exit with appropriate code
    if (results.failedTests > 0) {
      console.log('❌ Some tests failed. Please review the errors above.')
      process.exit(1)
    } else {
      console.log('✅ All tests passed! Database synchronization is working correctly.')
      process.exit(0)
    }

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error)
    logger.error('Test runner failed', {
      component: 'TestRunner',
      operation: 'main',
      metadata: { userId }
    }, error as Error)
    process.exit(1)
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
}) 