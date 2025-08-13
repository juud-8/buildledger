require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnon) {
  console.error('Missing VITE_SUPABASE_URL/SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnon);

const newUsers = [
  {
    email: 'admin@buildledger.pro',
    password: 'adminpassword01',
    fullName: 'BuildLedger Admin',
    companyName: 'BuildLedger',
    role: 'super_admin',
    subscriptionPlan: null // No subscription needed for admin
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
    subscriptionPlan: 'enterprise' // Free enterprise for life
  }
];

async function createNewUserAccounts() {
  console.log('🔧 Creating New User Accounts for BuildLedger...\n');

  for (const user of newUsers) {
    console.log(`\n📝 Creating account for: ${user.fullName} (${user.email})`);
    
    try {
      // Step 1: Create user in Supabase Auth
      console.log('  1. Creating user account...');
      
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.fullName,
            company_name: user.companyName
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log('  ✅ User already exists, proceeding with profile setup...');
          
          // Try to sign in to get user ID
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
          });

          if (signInError) {
            console.log(`  ❌ Sign in failed: ${signInError.message}`);
            continue;
          }

          await setupUserProfile(signInData.user.id, user);
          await supabase.auth.signOut();
          
        } else {
          console.log(`  ❌ Sign up failed: ${error.message}`);
          continue;
        }
      } else {
        console.log('  ✅ User created successfully!');
        console.log(`  User ID: ${data.user.id}`);
        
        if (data.session) {
          await setupUserProfile(data.user.id, user);
          await supabase.auth.signOut();
        } else {
          console.log('  ⚠️ Email confirmation required');
        }
      }

    } catch (error) {
      console.log(`  ❌ Error creating account: ${error.message}`);
    }
  }

  console.log('\n🎉 All user accounts setup completed!');
  console.log('\n📋 Account Summary:');
  newUsers.forEach(user => {
    console.log(`  • ${user.fullName}: ${user.email} (${user.subscriptionPlan || 'Admin'})`);
  });
}

async function setupUserProfile(userId, userData) {
  try {
    // Step 2: Create or update user profile
    console.log('  2. Setting up user profile...');
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role
        }])
        .select()
        .single();

      if (createError) {
        console.log(`  ❌ Failed to create profile: ${createError.message}`);
        return;
      }
      console.log('  ✅ Profile created successfully');
    } else {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: userData.fullName,
          role: userData.role
        })
        .eq('id', userId);

      if (updateError) {
        console.log(`  ❌ Failed to update profile: ${updateError.message}`);
        return;
      }
      console.log('  ✅ Profile updated successfully');
    }

    // Step 3: Create company
    console.log('  3. Creating company...');
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([{
        name: userData.companyName,
        slug: userData.companyName.toLowerCase().replace(/\s+/g, '-'),
        description: `${userData.companyName} - BuildLedger Customer`,
        email: userData.email
      }])
      .select()
      .single();

    if (companyError) {
      console.log(`  ❌ Failed to create company: ${companyError.message}`);
      return;
    }
    console.log(`  ✅ Company created: ${company.name}`);

    // Step 4: Link user to company
    const { error: linkError } = await supabase
      .from('user_profiles')
      .update({ company_id: company.id })
      .eq('id', userId);

    if (linkError) {
      console.log(`  ❌ Failed to link user to company: ${linkError.message}`);
      return;
    }
    console.log('  ✅ User linked to company');

    // Step 5: Set up subscription (if applicable)
    if (userData.subscriptionPlan) {
      console.log(`  4. Setting up ${userData.subscriptionPlan} subscription...`);
      
      // Get subscription plan ID
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', userData.subscriptionPlan)
        .single();

      if (planError) {
        console.log(`  ❌ Failed to find subscription plan: ${planError.message}`);
        return;
      }

      // Create user subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .insert([{
          user_id: userId,
          plan_id: plan.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        }])
        .select()
        .single();

      if (subError) {
        console.log(`  ❌ Failed to create subscription: ${subError.message}`);
        return;
      }
      console.log(`  ✅ ${userData.subscriptionPlan} subscription created`);
    } else {
      console.log('  4. No subscription needed (Admin account)');
    }

  } catch (error) {
    console.log(`  ❌ Error in profile setup: ${error.message}`);
  }
}

createNewUserAccounts().catch(console.error);