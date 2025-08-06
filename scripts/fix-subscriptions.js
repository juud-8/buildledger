require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const correctSubscriptions = [
  {
    email: 'pro@buildledger.com',
    planName: 'professional'
  },
  {
    email: 'enterprise@buildledger.com',
    planName: 'enterprise'
  },
  {
    email: 'dkaercher@buildledger.pro',
    planName: 'enterprise'
  }
];

async function fixSubscriptions() {
  console.log('🔧 Fixing subscription assignments...\n');

  for (const userSub of correctSubscriptions) {
    console.log(`📝 Updating ${userSub.email} to ${userSub.planName} plan...`);
    
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userSub.email)
        .single();

      if (profileError) {
        console.log(`  ❌ Failed to find user: ${profileError.message}`);
        continue;
      }

      // Get correct plan
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', userSub.planName)
        .single();

      if (planError) {
        console.log(`  ❌ Failed to find plan: ${planError.message}`);
        continue;
      }

      // Update subscription
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ plan_id: plan.id })
        .eq('user_id', profile.id);

      if (updateError) {
        console.log(`  ❌ Failed to update subscription: ${updateError.message}`);
      } else {
        console.log(`  ✅ Updated to ${userSub.planName} plan`);
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🔍 Final verification...');
  
  const { data: profiles, error: verifyError } = await supabase
    .from('user_profiles')
    .select(`
      email,
      full_name,
      companies (name),
      user_subscriptions (
        status,
        subscription_plans (name)
      )
    `)
    .in('email', [
      'admin@buildledger.pro',
      'starter@buildledger.com', 
      'pro@buildledger.com',
      'enterprise@buildledger.com',
      'dkaercher@buildledger.pro'
    ]);

  if (verifyError) {
    console.log(`❌ Verification failed: ${verifyError.message}`);
  } else {
    console.log('\n✅ All Target Accounts:');
    console.log('═══════════════════════════════════════════════');
    
    profiles.forEach(profile => {
      console.log(`👤 ${profile.full_name}`);
      console.log(`   📧 ${profile.email}`);
      console.log(`   🏢 ${profile.companies?.name || 'No Company'}`);
      console.log(`   📦 ${profile.user_subscriptions?.[0]?.subscription_plans?.name || 'No Plan'}`);
      console.log(`   📅 ${profile.user_subscriptions?.[0]?.status || 'N/A'}`);
      console.log('');
    });
  }
}

fixSubscriptions().catch(console.error);