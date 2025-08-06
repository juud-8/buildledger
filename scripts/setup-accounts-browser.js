/**
 * Browser-based Account Setup for BuildLedger
 * 
 * Run this in the browser console on your BuildLedger site
 * Make sure you're logged in as an admin first
 */

const accounts = [
  {
    email: 'demo@buildledger.com',
    password: 'demo123456',
    fullName: 'Demo User',
    companyName: 'Demo Construction Co',
    role: 'company_owner',
    plan: 'professional'
  },
  {
    email: 'admin@admin.com',
    password: 'adminpassword01',
    fullName: 'Super Administrator',
    companyName: 'BuildLedger Admin',
    role: 'super_admin',
    plan: 'enterprise'
  },
  {
    email: 'dave@buildledger.com',
    password: 'password44',
    fullName: 'Dave Kaercher',
    companyName: 'D & D Interiors',
    role: 'company_owner',
    plan: 'enterprise_lifetime'
  },
  {
    email: 'starter@test.com',
    password: 'starter123',
    fullName: 'Starter Test User',
    companyName: 'Starter Construction',
    role: 'company_owner',
    plan: 'starter_lifetime'
  },
  {
    email: 'professional@test.com',
    password: 'professional123',
    fullName: 'Professional Test User',
    companyName: 'Professional Construction',
    role: 'company_owner',
    plan: 'professional_lifetime'
  },
  {
    email: 'enterprise@test.com',
    password: 'enterprise123',
    fullName: 'Enterprise Test User',
    companyName: 'Enterprise Construction',
    role: 'company_owner',
    plan: 'enterprise_lifetime'
  }
];

async function createAccountsInBrowser() {
  console.log('🚀 Starting BuildLedger account setup...');
  
  // Import the auth service (assuming it's available globally)
  const { authService } = window;
  
  if (!authService) {
    console.error('❌ authService not found. Please make sure you\'re on the BuildLedger site.');
    return;
  }

  for (const account of accounts) {
    try {
      console.log(`\n🔄 Creating account: ${account.email}`);
      
      // Try to sign up the user
      const result = await authService.signUp(
        account.email,
        account.password,
        account.fullName,
        account.companyName
      );

      if (result.error && result.error.message.includes('User already registered')) {
        console.log(`⚠️  Account ${account.email} already exists`);
        continue;
      }

      if (result.error) {
        console.error(`❌ Error creating ${account.email}:`, result.error.message);
        continue;
      }

      console.log(`✅ Successfully created: ${account.email}`);
      
      // Wait a bit between creations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to create ${account.email}:`, error.message);
    }
  }

  console.log('\n📊 Account setup complete!');
  console.log('🎯 You can now log in with these accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  accounts.forEach(account => {
    console.log(`📧 ${account.email} / 🔑 ${account.password}`);
  });
}

// Export for manual execution
window.setupBuildLedgerAccounts = createAccountsInBrowser;

console.log('🎯 BuildLedger Account Setup Loaded!');
console.log('Run: setupBuildLedgerAccounts() in the console');