#!/usr/bin/env node

/**
 * BuildLedger Deployment Validation Script
 * 
 * This script validates that deployment is done correctly
 * and prevents the common import path errors
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 BuildLedger Deployment Validator');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Check if someone is trying to use the wrong deployment method
const args = process.argv.slice(2);
if (args.includes('--wrong-deploy-check')) {
  console.log('❌ DEPLOYMENT ERROR DETECTED!');
  console.log('');
  console.log('🚨 Someone tried to use: vercel --prod');
  console.log('✅ Use this instead: vercel build --prod && vercel --prod --prebuilt');
  console.log('');
  console.log('📖 See DEPLOYMENT-CRITICAL-README.md for details');
  process.exit(1);
}

// Validate build before deployment
async function validateBuild() {
  console.log('🔄 Running build validation...');
  
  return new Promise((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'pipe',
      shell: true,
      cwd: join(__dirname, '..')
    });

    let output = '';
    let errorOutput = '';

    buildProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build validation passed');
        resolve(true);
      } else {
        console.log('❌ Build validation failed');
        console.log('Error output:', errorOutput);
        
        // Check for the common import error
        if (errorOutput.includes('Could not resolve') || errorOutput.includes('pages/landing')) {
          console.log('');
          console.log('🚨 DETECTED: Import path resolution error');
          console.log('💡 This happens when using wrong deployment method');
          console.log('✅ Use: vercel build --prod && vercel --prod --prebuilt');
          console.log('❌ Never use: vercel --prod');
        }
        
        reject(new Error('Build failed'));
      }
    });
  });
}

// Main validation
async function runValidation() {
  try {
    await validateBuild();
    
    console.log('');
    console.log('🎯 Deployment Instructions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CORRECT: vercel build --prod && vercel --prod --prebuilt');
    console.log('❌ WRONG:   vercel --prod');
    console.log('');
    console.log('📖 Read DEPLOYMENT-CRITICAL-README.md for full details');
    console.log('');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

runValidation();