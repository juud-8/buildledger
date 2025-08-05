require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://lncppcvrhdduvobirzsv.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTQ3MzYsImV4cCI6MjA2OTkzMDczNn0.bc3_2fWJOfHR_w4aATIljLGwG0NlQ25S8hyoFeVL_pY'
);

async function createTestAccount() {
  console.log('🔧 Creating Test Account...\n');

  const testAccount = {
    email: 'demo@buildledger.com',
    password: 'demo123456',
    fullName: 'Demo User',
    companyName: 'Demo Construction Co'
  };

  try {
    console.log('1. Creating user account...');
    
    const { data, error } = await supabase.auth.signUp({
      email: testAccount.email,
      password: testAccount.password,
      options: {
        data: {
          full_name: testAccount.fullName,
          company_name: testAccount.companyName
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ User already exists, attempting to sign in...');
        
        // Try to sign in with the existing account
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testAccount.email,
          password: testAccount.password
        });

        if (signInError) {
          console.log('❌ Sign in failed:', signInError.message);
          console.log('💡 The account exists but password might be different');
          return;
        }

        console.log('✅ Sign in successful!');
        console.log('User ID:', signInData.user.id);
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (profileError) {
          console.log('⚠️  Profile not found, creating one...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{
              id: signInData.user.id,
              email: testAccount.email,
              full_name: testAccount.fullName,
              company_name: testAccount.companyName,
              subscription_status: 'trial'
            }])
            .select()
            .single();

          if (createError) {
            console.log('❌ Failed to create profile:', createError.message);
          } else {
            console.log('✅ Profile created successfully');
          }
        } else {
          console.log('✅ Profile found:', profile);
        }

        // Sign out
        await supabase.auth.signOut();
        
      } else {
        console.log('❌ Sign up failed:', error.message);
        return;
      }
    } else {
      console.log('✅ User created successfully!');
      console.log('User ID:', data.user.id);
      
      if (data.session) {
        console.log('✅ Session created (email confirmation not required)');
        
        // Check if profile was created by trigger
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.log('⚠️  Profile not found, creating one...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{
              id: data.user.id,
              email: testAccount.email,
              full_name: testAccount.fullName,
              company_name: testAccount.companyName,
              subscription_status: 'trial'
            }])
            .select()
            .single();

          if (createError) {
            console.log('❌ Failed to create profile:', createError.message);
          } else {
            console.log('✅ Profile created successfully');
          }
        } else {
          console.log('✅ Profile created by trigger:', profile);
        }

        // Sign out
        await supabase.auth.signOut();
        
      } else {
        console.log('📧 Email confirmation required');
        console.log('Please check your email to confirm the account');
      }
    }

    console.log('\n🎉 Test account setup completed!');
    console.log('\n📝 Login credentials:');
    console.log(`Email: ${testAccount.email}`);
    console.log(`Password: ${testAccount.password}`);
    console.log('\n💡 You can now use these credentials to log in to the application');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestAccount().catch(console.error); 