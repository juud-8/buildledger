# Database Migration Guide

This guide provides exact Supabase CLI commands and procedures for managing BuildLedger database migrations.

## Prerequisites

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   # or
   brew install supabase/tap/supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to your project:**
   ```bash
   supabase link --project-ref lncppcvrhdduvobirzsv
   ```

## Database Health Check

Run the health check first to assess the current database state:

```bash
# Using our custom script
npm run db:health

# Or with environment variables
SUPABASE_URL=https://lncppcvrhdduvobirzsv.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
npm run db:health
```

## Migration Commands

### 1. Apply Critical Client Type Migration

**Method 1: Using Supabase CLI (Recommended)**
```bash
supabase db push
```

**Method 2: Apply specific migration**
```bash
# Apply the client_type column migration
supabase db reset --linked

# Or apply individual migration
supabase migration up --file 20250808000000_add_client_type_column.sql
```

**Method 3: Manual SQL Execution**
If CLI fails, execute manually in Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/lncppcvrhdduvobirzsv/sql
2. Copy and paste the SQL from: `supabase/migrations/20250808000000_add_client_type_column.sql`
3. Click "Run" to execute

### 2. Apply Subscriptions Table Migration

```bash
# Apply the new subscriptions table
supabase migration up --file 20250808020000_create_subscriptions_table.sql
```

Or manually run the SQL from `supabase/migrations/20250808020000_create_subscriptions_table.sql`

### 3. Verify Migrations

```bash
# Check migration status
supabase migration list

# Run health check
npm run db:health
```

## Available NPM Scripts

```bash
# Database health check and validation
npm run db:health

# List all available migrations
npm run db:list

# Apply specific migration (requires manual Supabase Dashboard execution)
npm run db:migrate 20250808000000_add_client_type_column.sql

# Quick fix for client_type column (provides SQL to copy-paste)
npm run db:fix-client-type
```

## Migration Files Status

| Migration File | Status | Description |
|---------------|--------|-------------|
| `20250101000000_complete_buildledger_schema.sql` | ✅ Applied | Complete initial schema |
| `20250805020000_safe_schema_setup.sql` | ✅ Applied | Safe schema setup |
| `20250805030000_stripe_integration.sql` | ✅ Applied | Stripe integration tables |
| `20250805040000_user_profile_trigger.sql` | ✅ Applied | User profile triggers |
| `20250806000000_client_messaging_schema.sql` | ✅ Applied | Client messaging schema |
| `20250807000000_vendor_material_management.sql` | ✅ Applied | Vendor/material management |
| `20250808000000_add_client_type_column.sql` | ✅ Applied | Client type column (CRITICAL) |
| `20250808010000_invoice_customer_view.sql` | ✅ Applied | Invoice customer view |
| `20250808010500_quote_customer_view.sql` | ✅ Applied | Quote customer view |
| `20250808020000_create_subscriptions_table.sql` | 🔄 Pending | Subscriptions table (NEW) |

## Troubleshooting

### Common Issues

1. **"client_type column not found"**
   - Run: `npm run db:fix-client-type`
   - Copy the SQL output and paste it in Supabase Dashboard SQL Editor

2. **"subscriptions table does not exist"**
   - Apply migration: `20250808020000_create_subscriptions_table.sql`
   - Or create manually using the provided SQL

3. **CLI authentication fails**
   ```bash
   supabase logout
   supabase login
   supabase link --project-ref lncppcvrhdduvobirzsv
   ```

4. **Permission denied errors**
   - Ensure you're using the SERVICE_ROLE_KEY not the ANON_KEY
   - Check that environment variables are properly set

### Manual Migration Steps

If automated tools fail, follow these steps:

1. **Access Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/lncppcvrhdduvobirzsv/sql
   ```

2. **Execute Migration SQL:**
   - Copy content from migration file
   - Paste in SQL Editor
   - Click "Run"

3. **Verify Results:**
   ```bash
   npm run db:health
   ```

## Environment Variables Required

```bash
# Required for database operations
SUPABASE_URL=https://lncppcvrhdduvobirzsv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional for enhanced logging
LOG_LEVEL=info
NODE_ENV=development
```

## Production Deployment

For production deployments:

1. **Test migrations in staging first:**
   ```bash
   supabase db push --dry-run
   ```

2. **Apply migrations:**
   ```bash
   supabase db push
   ```

3. **Verify health:**
   ```bash
   npm run db:health
   ```

4. **Monitor application:**
   - Check application logs for database errors
   - Monitor Stripe webhook processing
   - Verify client creation functionality

## Support

If you encounter issues:

1. Run `npm run db:health` for diagnostics
2. Check Supabase Dashboard logs
3. Review migration file contents for syntax errors
4. Ensure all required environment variables are set
5. Try manual SQL execution as fallback