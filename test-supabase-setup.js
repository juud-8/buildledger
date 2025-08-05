// Test script to verify Supabase setup
// Run this with: node test-supabase-setup.js

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://lncppcvrhdduvobirzsv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTQ3MzYsImV4cCI6MjA2OTkzMDczNn0.bc3_2fWJOfHR_w4aATIljLGwG0NlQ25S8hyoFeVL_pY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseSetup() {
  console.log('🧪 Testing Supabase Setup...\n');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing connection...');
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connection successful\n');

    // Test 2: Check if tables exist
    console.log('2. Checking database schema...');
    const tables = [
      'user_profiles',
      'company_branding',
      'logo_assets',
      'document_templates',
      'brand_guidelines',
      'clients',
      'projects',
      'items',
      'quotes',
      'quote_items',
      'invoices',
      'invoice_items',
      'analytics_data'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: exists`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    console.log('');

    // Test 3: Check RLS policies
    console.log('3. Checking Row Level Security...');
    try {
      const { error } = await supabase.from('user_profiles').select('*');
      if (error && error.message.includes('policy')) {
        console.log('✅ RLS policies are active (expected error for unauthenticated access)');
      } else {
        console.log('⚠️  RLS policies may not be properly configured');
      }
    } catch (err) {
      console.log('✅ RLS policies are active');
    }
    console.log('');

    // Test 4: Test authentication
    console.log('4. Testing authentication...');
    const testEmail = 'test@buildledger.com';
    const testPassword = 'testpassword123';
    
    // Try to sign up a test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ Test user already exists');
      } else {
        console.log('❌ Sign up failed:', signUpError.message);
      }
    } else {
      console.log('✅ Test user created successfully');
    }

    // Test 5: Check if we can query with authentication
    console.log('\n5. Testing authenticated queries...');
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
    } else {
      console.log('✅ Authentication successful');
      
      // Test querying user's own data
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile query failed:', profileError.message);
      } else {
        console.log('✅ Profile query successful');
      }
    }

    console.log('\n🎉 Supabase setup test completed!');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm start');
    console.log('2. Navigate to http://localhost:3000');
    console.log('3. Test the authentication flow');
    console.log('4. Check if dashboard loads with real data');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSupabaseSetup(); 