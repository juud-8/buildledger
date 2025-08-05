require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lncppcvrhdduvobirzsv.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTQ3MzYsImV4cCI6MjA2OTkzMDczNn0.bc3_2fWJOfHR_w4aATIljLGwG0NlQ25S8hyoFeVL_pY'
);

async function testAuth() {
  try {
    console.log('🔍 Testing Authentication State...\n');

    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      return;
    }

    if (!session) {
      console.log('❌ No active session found');
      console.log('💡 You need to log in first');
      return;
    }

    console.log('✅ Active session found');
    console.log('👤 User ID:', session.user.id);
    console.log('📧 Email:', session.user.email);
    console.log('');

    // Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError);
      console.log('💡 Creating user profile...');
      
      // Create user profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || 'John Doe',
            company_name: session.user.user_metadata?.company_name || 'BuildLedger',
            subscription_status: 'trial'
          }
        ])
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create profile:', createError);
        return;
      }

      console.log('✅ User profile created');
      console.log('📋 Profile:', newProfile);
    } else {
      console.log('✅ User profile found');
      console.log('📋 Profile:', profile);
    }

  } catch (error) {
    console.error('❌ Error testing auth:', error);
  }
}

testAuth(); 