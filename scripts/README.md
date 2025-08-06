# Scripts

This directory contains utility scripts for development, database management, and deployment.

## User Management Scripts

### Account Setup
- **setup-accounts.js** - Main account setup script
- **setup-accounts-browser.js** - Browser-based account setup
- **setup-user-accounts.js** - User account creation
- **setup-user-accounts-final.js** - Final account setup steps
- **complete-user-setup.js** - Complete user setup process

### Account Management
- **create-new-user-accounts.js** - Create new user accounts
- **delete-users-admin.js** - Admin user deletion script
- **delete-users.ps1** - PowerShell user deletion script

## Stripe Integration Scripts
- **create-remaining-stripe-customers.js** - Create remaining Stripe customers
- **fix-subscriptions.js** - Fix subscription issues

## Deployment Scripts
- **validate-deployment.js** - Validate deployment configuration

## Usage

### Running Scripts

Most scripts require Supabase environment variables:

```bash
# Set environment variables
SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/script-name.js
```

### Database Scripts

Database management scripts should be run with caution:

```bash
# Example: Setup user accounts
node scripts/setup-user-accounts.js

# Example: Fix subscriptions  
node scripts/fix-subscriptions.js
```

### PowerShell Scripts

PowerShell scripts for Windows environments:

```powershell
# Example: Delete users
.\scripts\delete-users.ps1
```

## Safety Notes

⚠️ **Important**: 
- Always backup your database before running management scripts
- Test scripts in development environment first
- Review script contents before execution
- Some scripts require admin permissions

## Environment Variables

Common environment variables used:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key with admin permissions
- `STRIPE_SECRET_KEY` - Stripe secret key for payment operations

## Contributing

When adding new scripts:
1. Add descriptive comments
2. Include error handling
3. Add usage examples
4. Update this README
5. Test thoroughly before committing