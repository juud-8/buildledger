#!/usr/bin/env node

/**
 * BuildLedger Account Setup Script
 * 
 * This script creates the initial test accounts for the BuildLedger application.
 * Run with: node scripts/setup-accounts.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.production') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Account configurations
const accounts = [
  {
    email: 'demo@buildledger.com',
    password: 'demo123456',
    userId: 'f68fec3a-d1e5-4817-b932-61dc5e581c5a',
    fullName: 'Demo User',
    companyName: 'Demo Construction Co',
    role: 'company_owner',
    plan: 'professional',
    description: 'Main demo account for testing'
  },
  {
    email: 'admin@admin.com',
    password: 'adminpassword01',
    fullName: 'Super Administrator',
    companyName: 'BuildLedger Admin',
    role: 'super_admin',
    plan: 'enterprise',
    description: 'Super admin account with full system access'
  },
  {
    email: 'dave@buildledger.com',
    password: 'password44',
    fullName: 'Dave Kaercher',
    companyName: 'D & D Interiors',
    role: 'company_owner',
    plan: 'enterprise_lifetime',
    description: 'Lifetime Enterprise user - first real user'
  },
  {
    email: 'starter@test.com',
    password: 'starter123',
    fullName: 'Starter Test User',
    companyName: 'Starter Construction',
    role: 'company_owner',
    plan: 'starter_lifetime',
    description: 'Starter plan lifetime test account'
  },
  {
    email: 'professional@test.com',
    password: 'professional123',
    fullName: 'Professional Test User',
    companyName: 'Professional Construction',
    role: 'company_owner',
    plan: 'professional_lifetime',
    description: 'Professional plan lifetime test account'
  },
  {
    email: 'enterprise@test.com',
    password: 'enterprise123',
    fullName: 'Enterprise Test User',
    companyName: 'Enterprise Construction',
    role: 'company_owner',
    plan: 'enterprise_lifetime',
    description: 'Enterprise plan lifetime test account'
  }
];

async function createAccount(account) {
  try {
    console.log(`\n🔄 Creating account: ${account.email}`);

    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: account.fullName,
        company_name: account.companyName
      }
    });

    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log(`⚠️  User ${account.email} already exists, updating profile...`);
        return await updateExistingAccount(account);
      }
      throw authError;
    }

    const userId = account.userId || authData.user.id;
    console.log(`✅ Auth user created: ${userId}`);

    // Step 2: Wait for trigger to create profile (or create manually)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Update the user profile with additional details
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: account.email,
        full_name: account.fullName,
        role: account.role,
        company_name: account.companyName,
        subscription_plan: account.plan,
        subscription_status: 'active',
        preferences: {
          plan: account.plan,
          lifetime_access: account.plan.includes('lifetime'),
          payment_required: false
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error(`❌ Error creating profile for ${account.email}:`, profileError);
      return false;
    }

    // Step 4: Create company record if needed
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: `${userId}-company`,
        name: account.companyName,
        slug: account.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        owner_id: userId,
        settings: {
          plan: account.plan,
          created_by: 'setup-script'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (companyError) {
      console.warn(`⚠️  Company creation warning for ${account.email}:`, companyError.message);
    }

    console.log(`✅ Account created successfully: ${account.email}`);
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Role: ${account.role}`);
    console.log(`   - Plan: ${account.plan}`);
    console.log(`   - Company: ${account.companyName}`);
    
    return true;

  } catch (error) {
    console.error(`❌ Failed to create account ${account.email}:`, error.message);
    return false;
  }
}

async function updateExistingAccount(account) {
  try {
    // Get the existing user
    const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) throw searchError;

    const existingUser = existingUsers.users.find(user => user.email === account.email);
    
    if (!existingUser) {
      console.log(`❌ Could not find existing user: ${account.email}`);
      return false;
    }

    const userId = existingUser.id;

    // Update the user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: account.email,
        full_name: account.fullName,
        role: account.role,
        company_name: account.companyName,
        subscription_plan: account.plan,
        subscription_status: 'active',
        preferences: {
          plan: account.plan,
          lifetime_access: account.plan.includes('lifetime'),
          payment_required: false
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error(`❌ Error updating profile for ${account.email}:`, profileError);
      return false;
    }

    console.log(`✅ Account updated successfully: ${account.email}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to update account ${account.email}:`, error.message);
    return false;
  }
}

async function setupAccounts() {
  console.log('🚀 BuildLedger Account Setup Starting...');
  console.log(`📡 Connected to: ${supabaseUrl}`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const account of accounts) {
    const success = await createAccount(account);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  console.log('\n📊 Setup Complete!');
  console.log(`✅ Successfully created/updated: ${successCount} accounts`);
  console.log(`❌ Failed: ${failureCount} accounts`);

  if (successCount > 0) {
    console.log('\n🎯 Test Account Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    accounts.forEach(account => {
      console.log(`📧 ${account.email}`);
      console.log(`🔑 Password: ${account.password}`);
      console.log(`👤 Role: ${account.role}`);
      console.log(`🏢 Company: ${account.companyName}`);
      console.log(`📦 Plan: ${account.plan}`);
      console.log(`📝 ${account.description}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  }

  process.exit(failureCount === 0 ? 0 : 1);
}

// Run the setup
setupAccounts().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});