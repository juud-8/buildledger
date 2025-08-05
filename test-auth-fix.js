require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://lncppcvrhdduvobirzsv.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTQ3MzYsImV4cCI6MjA2OTkzMDczNn0.bc3_2fWJOfHR_w4aATIljLGwG0NlQ25S8hyoFeVL_pY'
);

async function testAuthFix() {
  console.log('🔧 Testing Authentication Fixes...\n');

  // Test 1: Check environment variables
  console.log('1. Checking environment variables...');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables');
    console.log('URL:', supabaseUrl ? '✅' : '❌');
    console.log('Key:', supabaseKey ? '✅' : '❌');
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log('URL format:', supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co') ? '✅' : '❌');
  console.log('Key format:', supabaseKey.startsWith('eyJ') ? '✅' : '❌');
  console.log('');

  // Test 2: Test connection
  console.log('2. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error && error.message.includes('policy')) {
      console.log('✅ Connection successful (RLS policies active)');
    } else if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    } else {
      console.log('✅ Connection successful');
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return;
  }
  console.log('');

  // Test 3: Test authentication with known accounts
  console.log('3. Testing authentication with test accounts...');
  
  const testAccounts = [
    { email: 'admin@admin.com', password: 'adminpassword01', name: 'Admin' },
    { email: 'dave@buildledger.com', password: 'password44', name: 'Dave' },
    { email: 'test@buildledger.com', password: 'test123456', name: 'Test' },
    { email: 'demo@buildledger.com', password: 'demo123456', name: 'Demo' }
  ];

  for (const account of testAccounts) {
    console.log(`Testing ${account.name} account (${account.email})...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) {
        console.log(`❌ ${account.name}: ${error.message}`);
      } else {
        console.log(`✅ ${account.name}: Login successful (User ID: ${data.user.id})`);
        
        // Test profile access
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.log(`⚠️  ${account.name}: Profile access failed - ${profileError.message}`);
        } else {
          console.log(`✅ ${account.name}: Profile access successful`);
        }
        
        // Sign out
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`❌ ${account.name}: Unexpected error - ${err.message}`);
    }
    
    console.log('');
  }

  console.log('🎉 Authentication fix test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Try logging in with the working accounts above');
  console.log('2. If none work, create a new account via registration');
  console.log('3. Check browser console for detailed error messages');
}

testAuthFix().catch(console.error); 