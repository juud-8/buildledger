# BuildLedger Account Setup Instructions

## Quick Setup Options

### Option 1: Using the Admin Setup Page (Recommended)

1. Navigate to: `https://buildledger.pro/admin-setup`
2. Click "Setup All Accounts" button
3. Wait for the process to complete
4. All accounts will be created automatically

### Option 2: Manual Registration

Visit `https://buildledger.pro/register` and manually create each account:

## Account Details

### 1. Demo Account (Main Testing)
- **Email:** demo@buildledger.com
- **Password:** demo123456
- **User ID:** f68fec3a-d1e5-4817-b932-61dc5e581c5a
- **Role:** company_owner
- **Company:** Demo Construction Co
- **Plan:** Professional

### 2. Super Admin Account
- **Email:** admin@admin.com
- **Password:** adminpassword01
- **Role:** super_admin
- **Company:** BuildLedger Admin
- **Plan:** Enterprise
- **Purpose:** Full system access

### 3. Dave Kaercher (First Real User)
- **Email:** dave@buildledger.com
- **Password:** password44
- **Role:** company_owner
- **Company:** D & D Interiors
- **Plan:** Enterprise Lifetime (No payment, track usage)
- **Special:** Close friend, first actual user

### 4. Starter Test Account
- **Email:** starter@test.com
- **Password:** starter123
- **Role:** company_owner
- **Company:** Starter Construction
- **Plan:** Starter Lifetime (No payment)

### 5. Professional Test Account
- **Email:** professional@test.com
- **Password:** professional123
- **Role:** company_owner
- **Company:** Professional Construction
- **Plan:** Professional Lifetime (No payment)

### 6. Enterprise Test Account
- **Email:** enterprise@test.com
- **Password:** enterprise123
- **Role:** company_owner
- **Company:** Enterprise Construction
- **Plan:** Enterprise Lifetime (No payment)

## Account Features by Plan

### Starter Plan
- Basic project management
- Limited clients/projects
- Basic reporting

### Professional Plan
- Full project management
- Unlimited clients/projects
- Advanced reporting
- Quote/Invoice generation

### Enterprise Plan
- All Professional features
- Multi-user support
- Advanced analytics
- Custom branding
- API access

## Notes

- All lifetime accounts have `payment_required: false` in their preferences
- Dave Kaercher's account should track usage for analytics purposes
- Admin account has super_admin role for system-wide access
- Demo account uses the specific UUID provided for consistency

## Troubleshooting

If account creation fails:

1. Check the browser console for errors
2. Verify Supabase connection is working
3. Try creating accounts one at a time manually
4. Check the database for existing accounts that might conflict

## Security Notes

- These are development/demo accounts only
- Change passwords in production
- Demo account UUID is intentionally static for testing
- All accounts are marked as email-verified to bypass confirmation

## After Setup

1. Test login with each account
2. Verify role-based permissions work correctly
3. Check that company data is properly isolated
4. Confirm subscription plans are correctly assigned