# Manual Database Cleanup Instructions

## ⚠️ IMPORTANT: Complete Fresh Start Process

The automatic cleanup tool can delete application data but cannot delete auth users due to Supabase security permissions. Follow these steps for a complete fresh start:

## Step 1: Run Automated Data Cleanup

1. Go to **https://buildledger.pro/admin-cleanup**
2. Check the confirmation box
3. Click "PERMANENTLY DELETE ALL DATA" 
4. Wait for completion (this deletes profiles, companies, projects, etc.)

## Step 2: Manual Auth User Deletion

### Option A: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Sign in to your account

2. **Open BuildLedger Project**
   - Find your BuildLedger project
   - Click to open it

3. **Navigate to Authentication**
   - In the left sidebar, click "Authentication"
   - Click "Users" tab

4. **Delete All Users**
   - You'll see a list of all users (demo@buildledger.com, admin@admin.com, etc.)
   - Select all users using checkboxes
   - Click the delete/trash icon
   - Confirm deletion

### Option B: SQL Query Method

1. **Go to SQL Editor**
   - In your Supabase dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run Cleanup Query**
   ```sql
   -- Delete all auth users (this will cascade delete related data)
   DELETE FROM auth.users;
   ```

3. **Execute the Query**
   - Click "Run" to execute
   - This will delete all authentication users

## Step 3: Create Fresh Accounts

1. **Go to Account Setup**
   - Visit: **https://buildledger.pro/admin-setup**

2. **Click "Setup All Accounts"**
   - This will create all 6 accounts with exact specifications:
   - demo@buildledger.com (with UUID f68fec3a-d1e5-4817-b932-61dc5e581c5a)
   - admin@admin.com (super admin)
   - dave@buildledger.com (enterprise lifetime)
   - starter/professional/enterprise test accounts

## Why Manual Deletion is Required

- **Supabase Security**: Anonymous (anon) keys cannot delete auth users
- **Service Role Key**: Would be needed for full admin access
- **RLS Policies**: Protect auth.users table from client-side deletion
- **Best Practice**: Manual deletion ensures intentional action

## Verification Steps

After completing all steps:

1. **Check Auth Users**: In Supabase dashboard, verify auth.users table is empty
2. **Check User Profiles**: In SQL editor, run: `SELECT * FROM user_profiles;` (should be empty)
3. **Test Account Creation**: Use /admin-setup to create fresh accounts
4. **Test Login**: Try logging in with demo@buildledger.com / demo123456

## Complete Account Specifications

After fresh setup, you'll have:

| Account | Email | Password | Role | Company | Plan |
|---------|-------|----------|------|---------|------|
| Demo | demo@buildledger.com | demo123456 | company_owner | Demo Construction Co | Professional |
| Admin | admin@admin.com | adminpassword01 | super_admin | BuildLedger Admin | Enterprise |
| Dave | dave@buildledger.com | password44 | company_owner | D & D Interiors | Enterprise Lifetime |
| Starter | starter@test.com | starter123 | company_owner | Starter Construction | Starter Lifetime |
| Professional | professional@test.com | professional123 | company_owner | Professional Construction | Professional Lifetime |
| Enterprise | enterprise@test.com | enterprise123 | company_owner | Enterprise Construction | Enterprise Lifetime |

## Troubleshooting

**If account creation still fails:**
1. Verify all auth users were deleted in Supabase dashboard
2. Check that user_profiles table is empty
3. Try creating accounts one at a time instead of all at once
4. Check browser console for specific error messages

**If you see "User already exists" errors:**
- Some auth users weren't deleted properly
- Go back to Supabase dashboard and delete remaining users

This process ensures a completely fresh start with no database conflicts or legacy data issues.