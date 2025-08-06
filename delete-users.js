import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables:')
  console.error('- VITE_SUPABASE_URL:', !!supabaseUrl)
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey)
  process.exit(1)
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const userIds = [
  'f68fec3a-d1e5-4817-b932-61dc5e581c5a',
  'cffdce92-1539-4e17-8d23-330ef749352d',
  '7322d1a6-b3ae-47da-ae27-526578ad9c83',
  '0b817180-5f29-4869-b733-74b9f24caa7d',
  'd0a36cd5-1741-411e-b811-0879fbfa5f04',
  'f263e9ae-9958-4859-953b-2f7f2d929dd3',
  '3d83dec8-538b-4c87-bac1-6dc7e6735192'
]

async function deleteUsers() {
  console.log(`Starting deletion of ${userIds.length} users...`)
  
  for (const userId of userIds) {
    try {
      console.log(`Deleting user: ${userId}`)
      
      // Delete user using admin API
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (error) {
        console.error(`❌ Failed to delete user ${userId}:`, error.message)
      } else {
        console.log(`✅ Successfully deleted user: ${userId}`)
      }
    } catch (error) {
      console.error(`❌ Error deleting user ${userId}:`, error.message)
    }
  }
  
  console.log('User deletion process completed.')
}

deleteUsers().catch(console.error)