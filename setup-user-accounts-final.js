require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Admin client for user creation
const adminSupabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Regular client for user operations
const userSupabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNTQ3MzYsImV4cCI6MjA2OTkzMDczNn0.bc3_2fWJOfHR_w4aATIljLGwG0NlQ25S8hyoFeVL_pY'
);

const newUsers = [
  {
    email: 'admin@buildledger.pro',
    password: 'adminpassword01',
    fullName: 'BuildLedger Admin',
    companyName: 'BuildLedger HQ',
    role: 'super_admin',
    subscriptionPlan: null
  },
  {
    email: 'starter@buildledger.com',
    password: 'starterpassword01',
    fullName: 'Starter User',
    companyName: 'Starter Construction Co',
    role: 'company_owner',
    subscriptionPlan: 'starter'
  },
  {
    email: 'pro@buildledger.com',
    password: 'propassword01',
    fullName: 'Professional User',
    companyName: 'Professional Construction Co',
    role: 'company_owner',
    subscriptionPlan: 'professional'
  },
  {
    email: 'enterprise@buildledger.com',
    password: 'enterprisepassword01',
    fullName: 'Enterprise User',
    companyName: 'Enterprise Construction Co',
    role: 'company_owner',
    subscriptionPlan: 'enterprise'
  },
  {
    email: 'dkaercher@buildledger.pro',
    password: 'password44',
    fullName: 'Dave Kaercher',
    companyName: 'D&D Construction',
    role: 'company_owner',
    subscriptionPlan: 'enterprise'
  }
];

async function createNewUserAccounts() {
  console.log('🔧 Setting up BuildLedger User Accounts...\n');

  for (const user of newUsers) {
    console.log(`\n📝 Setting up: ${user.fullName} (${user.email})`);
    
    try {
      // First, ensure user exists in auth
      let userId;
      
      // Try to sign in to get existing user
      const { data: signInData, error: signInError } = await userSupabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (signInError) {
        console.log('  ❌ User does not exist or password incorrect');
        console.log(`  📝 You need to create this user manually in Supabase Auth first:`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Password: ${user.password}`);
        continue;
      }

      userId = signInData.user.id;
      console.log(`  ✅ User authenticated, ID: ${userId}`);

      // Step 1: Update user profile with admin client
      console.log('  1. Updating user profile...');
      
      const { data: profile, error: profileError } = await adminSupabase
        .from('user_profiles')
        .upsert({
          id: userId,
          email: user.email,
          full_name: user.fullName,
          role: user.role
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (profileError) {
        console.log(`  ❌ Failed to update profile: ${profileError.message}`);
      } else {
        console.log('  ✅ Profile updated successfully');
      }

      // Step 2: Create company as the authenticated user
      console.log('  2. Creating company...');
      
      const companySlug = user.companyName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data: company, error: companyError } = await userSupabase
        .from('companies')
        .insert([{
          name: user.companyName,
          slug: companySlug + '-' + Date.now(), // Add timestamp to ensure uniqueness
          description: `${user.companyName} - BuildLedger Customer`,
          email: user.email
        }])
        .select()
        .single();

      if (companyError) {
        console.log(`  ❌ Failed to create company: ${companyError.message}`);
      } else {
        console.log(`  ✅ Company created: ${company.name}`);

        // Step 3: Link user to company
        const { error: linkError } = await adminSupabase
          .from('user_profiles')
          .update({ company_id: company.id })
          .eq('id', userId);

        if (linkError) {
          console.log(`  ❌ Failed to link user to company: ${linkError.message}`);
        } else {
          console.log('  ✅ User linked to company');
        }
      }

      // Step 4: Set up subscription (if applicable)
      if (user.subscriptionPlan) {
        console.log(`  3. Setting up ${user.subscriptionPlan} subscription...`);
        
        // Get subscription plan ID
        const { data: plan, error: planError } = await adminSupabase
          .from('subscription_plans')
          .select('id')
          .eq('name', user.subscriptionPlan)
          .single();

        if (planError) {
          console.log(`  ❌ Failed to find subscription plan: ${planError.message}`);
        } else {
          // Create user subscription
          const { data: subscription, error: subError } = await adminSupabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              plan_id: plan.id,
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
            }, {
              onConflict: 'user_id'
            })
            .select()
            .single();

          if (subError) {
            console.log(`  ❌ Failed to create subscription: ${subError.message}`);
          } else {
            console.log(`  ✅ ${user.subscriptionPlan} subscription activated`);
          }
        }
      } else {
        console.log('  3. No subscription needed (Admin account)');
      }

      // Sign out the user
      await userSupabase.auth.signOut();

    } catch (error) {
      console.log(`  ❌ Error setting up account: ${error.message}`);
    }
  }

  console.log('\n🎉 User account setup completed!');
  console.log('\n📋 Account Summary:');
  console.log('═══════════════════════════════════════════════');
  newUsers.forEach(user => {
    console.log(`👤 ${user.fullName}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔑 Password: ${user.password}`);
    console.log(`   🏢 Company: ${user.companyName}`);
    console.log(`   📦 Plan: ${user.subscriptionPlan || 'Admin Access'}`);
    console.log('');
  });
}

createNewUserAccounts().catch(console.error);