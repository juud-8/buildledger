require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Admin client for all operations
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

const users = [
  {
    email: 'starter@buildledger.com',
    fullName: 'Starter User',
    companyName: 'Starter Construction Co',
    subscriptionPlan: 'starter'
  },
  {
    email: 'pro@buildledger.com',
    fullName: 'Professional User',
    companyName: 'Professional Construction Co',
    subscriptionPlan: 'professional'
  },
  {
    email: 'enterprise@buildledger.com',
    fullName: 'Enterprise User',
    companyName: 'Enterprise Construction Co',
    subscriptionPlan: 'enterprise'
  },
  {
    email: 'dkaercher@buildledger.pro',
    fullName: 'Dave Kaercher',
    companyName: 'D&D Construction',
    subscriptionPlan: 'enterprise'
  }
];

async function completeUserSetup() {
  console.log('🔧 Completing user setup with admin privileges...\n');

  for (const user of users) {
    console.log(`\n📝 Completing setup for: ${user.fullName} (${user.email})`);
    
    try {
      // Get user by email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log(`  ❌ Failed to list users: ${authError.message}`);
        continue;
      }

      const authUser = authUsers.users.find(u => u.email === user.email);
      if (!authUser) {
        console.log('  ❌ User not found in auth');
        continue;
      }

      const userId = authUser.id;
      console.log(`  ✅ Found user ID: ${userId}`);

      // Step 1: Create company using admin privileges
      console.log('  1. Creating company...');
      
      const companySlug = user.companyName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now();

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: user.companyName,
          slug: companySlug,
          description: `${user.companyName} - BuildLedger Customer`,
          email: user.email
        }])
        .select()
        .single();

      if (companyError) {
        console.log(`  ❌ Failed to create company: ${companyError.message}`);
        continue;
      }
      
      console.log(`  ✅ Company created: ${company.name} (ID: ${company.id})`);

      // Step 2: Link user to company
      const { error: linkError } = await supabase
        .from('user_profiles')
        .update({ company_id: company.id })
        .eq('id', userId);

      if (linkError) {
        console.log(`  ❌ Failed to link user to company: ${linkError.message}`);
      } else {
        console.log('  ✅ User linked to company');
      }

      // Step 3: Set up subscription
      console.log(`  2. Setting up ${user.subscriptionPlan} subscription...`);
      
      // Get subscription plan
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', user.subscriptionPlan)
        .single();

      if (planError) {
        console.log(`  ❌ Failed to find subscription plan: ${planError.message}`);
        continue;
      }

      // Create subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: userId,
          plan_id: plan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        }])
        .select()
        .single();

      if (subError) {
        console.log(`  ❌ Failed to create subscription: ${subError.message}`);
      } else {
        console.log(`  ✅ ${user.subscriptionPlan} subscription created`);
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 User setup completed!');
  
  // Verify setup
  console.log('\n🔍 Verifying user accounts...');
  
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select(`
      *,
      companies (*),
      user_subscriptions (
        *,
        subscription_plans (*)
      )
    `);

  if (profilesError) {
    console.log(`❌ Failed to verify: ${profilesError.message}`);
  } else {
    console.log('\n📋 Final Account Summary:');
    console.log('═══════════════════════════════════════════════');
    
    profiles.forEach(profile => {
      console.log(`👤 ${profile.full_name || profile.email}`);
      console.log(`   📧 Email: ${profile.email}`);
      console.log(`   🏢 Company: ${profile.companies?.name || 'None'}`);
      console.log(`   📦 Plan: ${profile.user_subscriptions?.[0]?.subscription_plans?.name || 'None'}`);
      console.log(`   📅 Status: ${profile.user_subscriptions?.[0]?.status || 'N/A'}`);
      console.log('');
    });
  }
}

completeUserSetup().catch(console.error);