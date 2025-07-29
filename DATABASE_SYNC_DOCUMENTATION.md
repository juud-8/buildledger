# BuildLedger Database Synchronization Documentation

## Overview

This document outlines the comprehensive database synchronization between the local BuildLedger codebase and the live Supabase database. The synchronization ensures that all database structures, types, and functionality are consistent and production-ready.

## Table of Contents

1. [Database Schema Changes](#database-schema-changes)
2. [Code Updates](#code-updates)
3. [Logo URL Integration](#logo-url-integration)
4. [User Management](#user-management)
5. [Bucket Configuration](#bucket-configuration)
6. [Error Handling](#error-handling)
7. [Testing](#testing)
8. [Migration Guide](#migration-guide)
9. [Troubleshooting](#troubleshooting)

## Database Schema Changes

### Profiles Table Enhancements

The `profiles` table has been enhanced with the following new fields:

```sql
-- New fields added to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_payment_terms INTEGER DEFAULT 30;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_tax_rate NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

**Key Features:**
- **Plan Tier Management**: Supports `free`, `pro`, and `business` tiers
- **Subscription Status**: Tracks `active`, `cancelled`, `past_due`, and `trialing` states
- **Business Information**: Complete business profile with address, phone, and email
- **Stripe Integration**: Customer and subscription ID fields for payment processing
- **Settings Storage**: JSONB field for flexible user preferences

### Clients Table Enhancements

The `clients` table now includes comprehensive client management features:

```sql
-- New fields added to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_invoiced NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_invoice_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE;
```

**Key Features:**
- **Client Tagging**: Array-based tagging system for organization
- **Business Metrics**: Automatic tracking of invoiced and paid amounts
- **Contact Management**: Dedicated contact person and website fields
- **Industry Classification**: Industry field for better categorization
- **Tax Management**: Tax exemption status and payment terms

### Invoices and Quotes Tables

Both tables have been enhanced with additional metadata fields:

```sql
-- Invoices table enhancements
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Quotes table enhancements
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

## Code Updates

### TypeScript Types

The `src/lib/types.ts` file has been updated to match the live database structure:

```typescript
// Updated Profile interface
export interface Profile extends BaseEntity {
  // Basic information
  name?: string
  company_name?: string
  logo_url?: string
  plan_tier: PlanTier
  subscription_status: SubscriptionStatus
  
  // Business settings
  default_payment_terms?: number
  default_tax_rate?: number
  business_address?: string
  business_phone?: string
  business_email?: string
  
  // Stripe integration
  stripe_customer_id?: string
  stripe_subscription_id?: string
  
  // Metadata
  settings?: UserSettings
}

// Updated Client interface
export interface Client extends BaseEntity {
  user_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  
  // Enhanced client information
  tags?: string[]
  contact_person?: string
  website?: string
  industry?: string
  
  // Business metrics
  total_invoiced?: number
  total_paid?: number
  last_invoice_date?: string
  payment_terms?: number
  tax_exempt?: boolean
}
```

### Supabase Client Types

The `src/lib/supabaseClient.ts` file now includes complete type definitions:

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          company_name: string | null
          logo_url: string | null
          plan_tier: 'free' | 'pro' | 'business'
          default_payment_terms: number | null
          default_tax_rate: number | null
          business_address: string | null
          business_phone: string | null
          business_email: string | null
          settings: any | null
          subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string | null
        }
        // ... Insert and Update types
      }
      // ... Other table definitions
    }
    Functions: {
      get_logo_url: {
        Args: { user_id: string; filename?: string }
        Returns: string | null
      }
    }
  }
}
```

## Logo URL Integration

### Storage Bucket Configuration

The `logos` bucket is configured with the following settings:

```sql
-- Bucket configuration
{
  "id": "logos",
  "name": "logos",
  "public": true,
  "allowed_mime_types": [
    "image/png",
    "image/jpeg", 
    "image/jpg",
    "image/webp",
    "image/svg+xml"
  ]
}
```

### Logo Management Functions

The database includes a `get_logo_url` function for dynamic logo URL generation:

```sql
CREATE OR REPLACE FUNCTION get_logo_url(user_id UUID, filename TEXT DEFAULT 'logo')
RETURNS TEXT AS $$
DECLARE
    logo_url TEXT;
BEGIN
    -- Get logo URL from profiles table
    SELECT p.logo_url INTO logo_url
    FROM profiles p
    WHERE p.id = user_id;
    
    -- If no logo URL in database, construct from storage
    IF logo_url IS NULL THEN
        logo_url := 'https://' || current_setting('app.settings.supabase_url') || 
                   '/storage/v1/object/public/logos/' || user_id || '/' || filename;
    END IF;
    
    RETURN logo_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Logo Upload Process

The logo upload process includes comprehensive validation:

1. **File Type Validation**: Only allows PNG, JPEG, WebP, and SVG files
2. **File Size Validation**: Maximum 5MB file size
3. **Filename Validation**: Ensures safe filenames
4. **Storage Organization**: Files stored in `{userId}/{filename}` structure
5. **URL Generation**: Automatic public URL generation
6. **Profile Update**: Logo URL stored in profiles table

```typescript
// Example logo upload usage
const result = await uploadLogo(userId, file)
if (result.success) {
  console.log('Logo uploaded:', result.url)
} else {
  console.error('Upload failed:', result.error)
}
```

## User Management

### Automatic Profile Creation

New users automatically get profiles created via database trigger:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, plan_tier, subscription_status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'free',
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Profile Synchronization

The profile service ensures proper synchronization:

```typescript
// Get user profile with caching
const { profile, error } = await getUserProfile(userId)

// Update profile with validation
const { success, error } = await updateUserProfile(userId, {
  name: 'New Name',
  company_name: 'New Company',
  default_payment_terms: 45
})
```

## Bucket Configuration

### Storage Policies

The logos bucket includes proper security policies:

```sql
-- Allow authenticated users to upload their own logos
CREATE POLICY "Users can upload their own logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'logos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow public read access to logos
CREATE POLICY "Public read access to logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'logos');
```

### File Organization

Files are organized by user ID for security and organization:

```
logos/
├── user-id-1/
│   ├── logo.png
│   └── logo-backup.jpg
├── user-id-2/
│   └── company-logo.svg
└── ...
```

## Error Handling

### Comprehensive Error Management

All database operations include robust error handling:

```typescript
// Database operation with retry logic
const result = await db.executeQuery('select', 'profiles', async () => {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
})

if (result.error) {
  logger.error('Database operation failed', {
    component: 'Database',
    operation: 'select',
    metadata: { table: 'profiles', userId }
  }, result.error)
}
```

### Validation Functions

Input validation ensures data integrity:

```typescript
// Profile validation
const validation = validateProfile(profileData)
if (!validation.valid) {
  return { 
    success: false, 
    error: `Validation failed: ${validation.errors.join(', ')}` 
  }
}
```

### Graceful Degradation

The application handles missing or invalid data gracefully:

```typescript
// Logo display with fallback
{profile?.logo_url ? (
  <Image
    src={profile.logo_url}
    alt="Company Logo"
    onError={(e) => {
      // Hide broken images
      const target = e.target as HTMLImageElement
      target.style.display = 'none'
    }}
  />
) : (
  <DefaultLogo />
)}
```

## Testing

### Database Test Suite

A comprehensive test suite validates all functionality:

```typescript
// Run complete test suite
const testSuite = new DatabaseTestSuite({
  testUserId: 'test-user-id',
  cleanupAfterTests: true
})

const results = await testSuite.runAllTests()
console.log(results.summary)
```

### Test Categories

The test suite covers:

1. **Connection Tests**: Database connectivity and health checks
2. **Profile Tests**: User profile CRUD operations
3. **Client Tests**: Client management functionality
4. **Invoice Tests**: Invoice creation and management
5. **Quote Tests**: Quote operations
6. **Logo Tests**: Logo upload and retrieval
7. **User Management Tests**: User creation and statistics
8. **Data Integrity Tests**: Foreign key constraints and data types
9. **Performance Tests**: Query performance and batch operations

### Quick Health Check

For rapid validation:

```typescript
const isHealthy = await quickHealthCheck()
if (!isHealthy) {
  console.error('Database health check failed')
}
```

## Migration Guide

### Running the Migration

1. **Execute the migration script**:
   ```sql
   -- Run database_sync_migration.sql in Supabase SQL Editor
   ```

2. **Verify the migration**:
   ```sql
   -- Check table structures
   SELECT table_name, column_name, data_type 
   FROM information_schema.columns 
   WHERE table_schema = 'public' 
   ORDER BY table_name, ordinal_position;
   ```

3. **Run the test suite**:
   ```typescript
   import { runDatabaseTests } from '@/lib/databaseTestSuite'
   
   const results = await runDatabaseTests('your-test-user-id')
   console.log(results.summary)
   ```

### Pre-Migration Checklist

- [ ] Backup existing data
- [ ] Test in development environment
- [ ] Verify all existing functionality works
- [ ] Check for any custom modifications

### Post-Migration Verification

- [ ] All tables have correct structure
- [ ] RLS policies are active
- [ ] Triggers are working
- [ ] Functions are accessible
- [ ] Test suite passes
- [ ] Logo upload works
- [ ] User profiles are created automatically

## Troubleshooting

### Common Issues

#### 1. RLS Policy Errors

**Problem**: Users can't access their data
**Solution**: Verify RLS policies are active and correct

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### 2. Logo Upload Failures

**Problem**: Logo uploads fail
**Solution**: Check bucket configuration and policies

```sql
-- Verify bucket exists
SELECT * FROM storage.buckets WHERE name = 'logos';

-- Check bucket policies
SELECT * FROM storage.policies WHERE bucket_id = 'logos';
```

#### 3. Profile Creation Issues

**Problem**: New users don't get profiles
**Solution**: Verify trigger is active

```sql
-- Check trigger
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

#### 4. Type Mismatches

**Problem**: TypeScript errors about missing fields
**Solution**: Regenerate types or update manually

```typescript
// Update types to match database
import { Database } from '@/lib/supabaseClient'
type Tables = Database['public']['Tables']
```

### Performance Issues

#### 1. Slow Queries

**Solution**: Check indexes and query optimization

```sql
-- Check existing indexes
SELECT indexname, tablename, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Add missing indexes if needed
CREATE INDEX IF NOT EXISTS idx_profiles_plan_tier ON profiles(plan_tier);
```

#### 2. Connection Pool Exhaustion

**Solution**: Monitor connection usage

```typescript
const poolStatus = db.getConnectionPoolStatus()
console.log('Active connections:', poolStatus.activeConnections)
```

### Debugging Tools

#### 1. Database Logs

Enable detailed logging in development:

```typescript
// In supabaseClient.ts
fetch: isProduction() ? undefined : (url, options = {}) => {
  logger.debug('Supabase request', { url, method: options.method })
  return fetch(url, options)
}
```

#### 2. Health Monitoring

Regular health checks:

```typescript
// Monitor database health
setInterval(async () => {
  const isHealthy = await db.healthCheck()
  if (!isHealthy) {
    logger.warn('Database health check failed')
  }
}, 5 * 60 * 1000) // Every 5 minutes
```

## Best Practices

### 1. Data Validation

Always validate data before database operations:

```typescript
const validation = validateProfile(profileData)
if (!validation.valid) {
  throw new Error(`Invalid profile data: ${validation.errors.join(', ')}`)
}
```

### 2. Error Handling

Use comprehensive error handling:

```typescript
try {
  const result = await databaseOperation()
  if (result.error) {
    logger.error('Operation failed', { error: result.error })
    // Handle error appropriately
  }
} catch (error) {
  logger.error('Unexpected error', error)
  // Handle unexpected errors
}
```

### 3. Caching

Use caching for frequently accessed data:

```typescript
// Profile caching in profileService.ts
const cached = getCachedProfile(userId)
if (cached) {
  return { profile: cached, error: null }
}
```

### 4. Monitoring

Monitor database performance and errors:

```typescript
// Log database operations
logger.logDatabaseOperation(operation, table, success, duration, error)
```

## Conclusion

This database synchronization ensures that BuildLedger has a robust, scalable, and maintainable database structure. The comprehensive testing suite and documentation provide confidence in the system's reliability and make future development easier.

For questions or issues, refer to the troubleshooting section or run the test suite to identify specific problems. 