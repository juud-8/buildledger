#!/usr/bin/env node

/**
 * Database Management Script for BuildLedger
 * 
 * Handles database migrations, health checks, and schema validation
 * Uses Supabase client with service role for administrative operations
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

class DatabaseManager {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.serviceRoleKey) {
      console.error('❌ Missing required environment variables:');
      console.error('   SUPABASE_URL:', !!this.supabaseUrl ? '✓' : '❌');
      console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!this.serviceRoleKey ? '✓' : '❌');
      process.exit(1);
    }

    this.supabase = createClient(this.supabaseUrl, this.serviceRoleKey, {
      auth: { persistSession: false }
    });

    this.migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  }

  async healthCheck() {
    console.log('🏥 Running database health check...\n');
    
    try {
      // Test basic connectivity
      const startTime = Date.now();
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        console.error('❌ Database connectivity failed:', error.message);
        return false;
      }

      console.log('✅ Database connectivity:', `OK (${responseTime}ms)`);

      // Check critical tables exist
      const criticalTables = [
        'user_profiles', 'companies', 'clients', 'projects', 
        'quotes', 'invoices', 'items_database', 'subscriptions'
      ];

      console.log('\n📋 Checking critical tables:');
      for (const table of criticalTables) {
        try {
          const { error: tableError } = await this.supabase
            .from(table)
            .select('count')
            .limit(1);

          if (tableError) {
            console.log(`   ❌ ${table}: ${tableError.message}`);
          } else {
            console.log(`   ✅ ${table}: OK`);
          }
        } catch (err) {
          console.log(`   ❌ ${table}: ${err.message}`);
        }
      }

      // Check for client_type column specifically
      console.log('\n🔍 Checking client_type column:');
      try {
        const { data: clientData, error: clientError } = await this.supabase
          .from('clients')
          .select('client_type')
          .limit(1);

        if (clientError && clientError.code === 'PGRST116') {
          console.log('   ❌ client_type column: MISSING - needs migration');
        } else if (clientError) {
          console.log(`   ❌ client_type column: ERROR - ${clientError.message}`);
        } else {
          console.log('   ✅ client_type column: OK');
        }
      } catch (err) {
        console.log(`   ❌ client_type column: ${err.message}`);
      }

      // Check RLS policies
      console.log('\n🔒 Row Level Security status: (Manual check required)');
      console.log('   Run: SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = \'public\';');

      console.log('\n✅ Health check completed');
      return true;

    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return false;
    }
  }

  async runMigration(migrationFile) {
    console.log(`🔄 Running migration: ${migrationFile}`);
    
    try {
      const migrationPath = path.join(this.migrationsDir, migrationFile);
      const migrationSQL = await fs.readFile(migrationPath, 'utf8');
      
      console.log('📄 Migration content preview:');
      console.log(migrationSQL.substring(0, 200) + '...\n');

      // Execute the migration
      const { data, error } = await this.supabase.rpc('exec_sql', {
        sql: migrationSQL
      });

      if (error) {
        // Try alternative approach - direct SQL execution via edge function
        console.log('🔄 Trying alternative migration approach...');
        
        // For now, provide manual instructions
        console.log('❌ Automatic migration failed. Please run manually:');
        console.log('\n📋 Manual Migration Instructions:');
        console.log('1. Go to Supabase Dashboard → SQL Editor');
        console.log('2. Copy and paste the following SQL:');
        console.log('\n--- COPY BELOW ---');
        console.log(migrationSQL);
        console.log('--- COPY ABOVE ---\n');
        console.log('3. Click "Run" to execute the migration');
        console.log('4. Run "npm run db:health" to verify the migration');
        
        return false;
      }

      console.log('✅ Migration executed successfully');
      return true;

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      console.log('\n📋 Manual Migration Instructions:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Run the migration file manually:', migrationFile);
      return false;
    }
  }

  async fixClientTypeColumn() {
    console.log('🔧 Attempting to fix client_type column...\n');

    const fixSQL = `
-- Create enum type for client_type
CREATE TYPE IF NOT EXISTS public.client_type AS ENUM ('residential', 'commercial', 'industrial', 'government');

-- Add client_type column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'clients' 
                   AND column_name = 'client_type') THEN
        
        ALTER TABLE public.clients 
        ADD COLUMN client_type public.client_type DEFAULT 'residential';
        
    END IF;
END $$;

-- Add other missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'clients' 
                   AND column_name = 'payment_terms') THEN
        
        ALTER TABLE public.clients 
        ADD COLUMN payment_terms TEXT DEFAULT 'net30';
        
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'clients' 
                   AND column_name = 'preferred_contact_method') THEN
        
        ALTER TABLE public.clients 
        ADD COLUMN preferred_contact_method TEXT DEFAULT 'email';
        
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clients_client_type ON public.clients(client_type);
`;

    console.log('📋 CRITICAL: Run this SQL in Supabase Dashboard:');
    console.log('\n--- COPY TO SUPABASE SQL EDITOR ---');
    console.log(fixSQL);
    console.log('--- END SQL ---\n');

    console.log('⚠️  Instructions:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to: https://supabase.com/dashboard → Your Project → SQL Editor');
    console.log('3. Paste and run the SQL');
    console.log('4. Run: npm run db:health to verify');
    
    return true;
  }

  async listMigrations() {
    console.log('📁 Available migrations:\n');
    
    try {
      const files = await fs.readdir(this.migrationsDir);
      const migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();

      migrationFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });

      console.log(`\n📊 Total migrations: ${migrationFiles.length}`);
      return migrationFiles;
    } catch (error) {
      console.error('❌ Failed to list migrations:', error.message);
      return [];
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const dbManager = new DatabaseManager();

  console.log('🗃️  BuildLedger Database Manager\n');

  switch (command) {
    case 'health':
      await dbManager.healthCheck();
      break;

    case 'migrate':
      const migrationFile = process.argv[3];
      if (!migrationFile) {
        console.log('❌ Please specify migration file');
        console.log('Usage: npm run db:migrate <migration-file>');
        console.log('\nAvailable migrations:');
        await dbManager.listMigrations();
        process.exit(1);
      }
      await dbManager.runMigration(migrationFile);
      break;

    case 'fix-client-type':
      await dbManager.fixClientTypeColumn();
      break;

    case 'list':
      await dbManager.listMigrations();
      break;

    default:
      console.log('📋 Available commands:');
      console.log('   npm run db:health              - Run health check');
      console.log('   npm run db:migrate <file>      - Run specific migration');
      console.log('   npm run db:fix-client-type     - Fix client_type column issue');
      console.log('   npm run db:list                - List available migrations');
      console.log('\nExamples:');
      console.log('   npm run db:health');
      console.log('   npm run db:migrate 20250808000000_add_client_type_column.sql');
      console.log('   npm run db:fix-client-type');
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseManager;