require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseAdmin = createClient(
  'https://lncppcvrhdduvobirzsv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM1NDczNiwiZXhwIjoyMDY5OTMwNzM2fQ.x3IG9nJIJSTeP42mQ9f6VcdtvafZhof31KgEjhLkr-k',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const userIds = [
  'f68fec3a-d1e5-4817-b932-61dc5e581c5a',
  'cffdce92-1539-4e17-8d23-330ef749352d',
  '7322d1a6-b3ae-47da-ae27-526578ad9c83',
  '0b817180-5f29-4869-b733-74b9f24caa7d',
  'd0a36cd5-1741-411e-b811-0879fbfa5f04',
  'f263e9ae-9958-4859-953b-2f7f2d929dd3',
  '3d83dec8-538b-4c87-bac1-6dc7e6735192'
];

async function deleteUsers() {
  console.log('🗑️  Starting deletion of users from Supabase...\n');
  
  let deletedCount = 0;
  let failedCount = 0;
  
  for (const userId of userIds) {
    try {
      console.log(`Deleting user: ${userId}`);
      
      // Delete user using admin API
      const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (error) {
        console.log(`❌ Failed to delete user ${userId}:`, error.message);
        failedCount++;
      } else {
        console.log(`✅ Successfully deleted user: ${userId}`);
        deletedCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`❌ Error deleting user ${userId}:`, error.message);
      failedCount++;
    }
  }
  
  console.log(`\n📊 Deletion Summary:`);
  console.log(`   ✅ Successfully deleted: ${deletedCount} users`);
  console.log(`   ❌ Failed to delete: ${failedCount} users`);
  console.log(`   📝 Total processed: ${userIds.length} users`);
  
  if (deletedCount === userIds.length) {
    console.log('\n🎉 All users successfully deleted!');
  } else if (deletedCount > 0) {
    console.log('\n⚠️  Some users were deleted, but there were failures.');
  } else {
    console.log('\n❌ No users were deleted. Check your credentials and user IDs.');
  }
}

async function listUsersFirst() {
  console.log('📋 First, let me check which users exist...\n');
  
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Failed to list users:', error.message);
      return false;
    }
    
    console.log(`Found ${data.users.length} total users in database`);
    
    const targetUsers = data.users.filter(user => userIds.includes(user.id));
    console.log(`Found ${targetUsers.length} target users to delete:\n`);
    
    targetUsers.forEach(user => {
      console.log(`  • ${user.email} (${user.id})`);
    });
    
    console.log('\n');
    return true;
    
  } catch (error) {
    console.log('❌ Error listing users:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 BuildLedger User Deletion Tool\n');
  
  // First list existing users
  const canProceed = await listUsersFirst();
  
  if (!canProceed) {
    console.log('❌ Cannot proceed with deletion due to listing error.');
    return;
  }
  
  // Proceed with deletion
  await deleteUsers();
}

main().catch(console.error);