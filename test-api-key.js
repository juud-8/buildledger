// Test script to validate multi-provider AI system
import { multiAI } from './src/utils/aiClient.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testMultiProviderAI() {
  console.log('🔍 Testing Multi-Provider AI System...\n');
  
  console.log('Available providers:', multiAI.getAvailableProviders());
  console.log('Current provider:', multiAI.getCurrentProvider());
  console.log();

  // Test finding working provider
  console.log('🔍 Finding working provider...');
  const workingProvider = await multiAI.findWorkingProvider();
  
  if (workingProvider) {
    console.log(`✅ Found working provider: ${workingProvider.name}`);
    console.log();
    
    // Test response generation
    console.log('🧪 Testing response generation...');
    const testMessages = [
      { role: 'system', content: 'You are a helpful AI assistant.' },
      { role: 'user', content: 'Say hello in exactly 3 words.' }
    ];
    
    try {
      const result = await multiAI.generateResponse(testMessages, { max_tokens: 50 });
      console.log('✅ Response generation successful!');
      console.log(`Provider used: ${result.provider}`);
      console.log(`Response: "${result.content}"`);
      console.log(`Success: ${result.success}`);
    } catch (error) {
      console.error('❌ Response generation failed:', error.message);
    }
    
  } else {
    console.log('❌ No working provider found');
    console.log('\n📋 Troubleshooting:');
    console.log('1. Check your API keys in .env file');
    console.log('2. Verify your API quotas/billing');
    console.log('3. Check internet connection');
    
    // Test fallback response
    console.log('\n🔄 Testing fallback response...');
    const testMessages = [
      { role: 'user', content: 'Test message' }
    ];
    
    const fallbackResult = await multiAI.generateResponse(testMessages);
    console.log('Fallback response:', fallbackResult.content);
    console.log('Fallback success:', fallbackResult.success);
  }
}

testMultiProviderAI().catch(console.error);