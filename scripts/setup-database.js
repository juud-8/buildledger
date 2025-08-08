#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://lncppcvrhdduvobirzsv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM1NDczNiwiZXhwIjoyMDY5OTMwNzM2fQ.x3IG9nJIJSTeP42mQ9f6VcdtvafZhof31KgEjhLkr-k';

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addClientTypeColumn() {
  try {
    console.log('🔧 Adding client_type column to clients table...');
    
    // First check if the column already exists
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'clients')
      .eq('column_name', 'client_type');
    
    if (checkError) {
      console.error('Error checking column existence:', checkError);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ client_type column already exists');
      return;
    }
    
    // Create enum type first if it doesn't exist
    const createEnumSQL = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_type') THEN
              CREATE TYPE public.client_type AS ENUM ('residential', 'commercial', 'industrial', 'government');
          END IF;
      END $$;
    `;
    
    console.log('Creating client_type enum...');
    await supabase.rpc('query', { query: createEnumSQL });
    
    // Add the column
    const addColumnSQL = `
      ALTER TABLE public.clients 
      ADD COLUMN IF NOT EXISTS client_type public.client_type DEFAULT 'residential';
    `;
    
    console.log('Adding client_type column...');
    await supabase.rpc('query', { query: addColumnSQL });
    
    // Add other missing columns
    const addOtherColumnsSQL = `
      ALTER TABLE public.clients 
      ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'net30',
      ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';
    `;
    
    console.log('Adding other missing columns...');
    await supabase.rpc('query', { query: addOtherColumnsSQL });
    
    console.log('✅ Successfully added missing columns to clients table!');
    
  } catch (error) {
    console.error('❌ Failed to add columns:', error);
    
    // Try alternative approach using direct SQL
    console.log('🔄 Trying alternative approach...');
    try {
      const result = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          query: `
            DO $$ 
            BEGIN
                -- Create enum type if it doesn't exist
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_type') THEN
                    CREATE TYPE public.client_type AS ENUM ('residential', 'commercial', 'industrial', 'government');
                END IF;
                
                -- Add columns if they don't exist
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_schema = 'public' 
                               AND table_name = 'clients' 
                               AND column_name = 'client_type') THEN
                    ALTER TABLE public.clients ADD COLUMN client_type public.client_type DEFAULT 'residential';
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_schema = 'public' 
                               AND table_name = 'clients' 
                               AND column_name = 'payment_terms') THEN
                    ALTER TABLE public.clients ADD COLUMN payment_terms TEXT DEFAULT 'net30';
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_schema = 'public' 
                               AND table_name = 'clients' 
                               AND column_name = 'preferred_contact_method') THEN
                    ALTER TABLE public.clients ADD COLUMN preferred_contact_method TEXT DEFAULT 'email';
                END IF;
            END $$;
          `
        })
      });
      
      if (result.ok) {
        console.log('✅ Successfully added columns using direct API approach!');
      } else {
        console.error('❌ Direct API approach also failed:', await result.text());
      }
      
    } catch (altError) {
      console.error('❌ Alternative approach failed:', altError);
    }
  }
}

// Check if clients table exists first
async function checkDatabase() {
  try {
    console.log('🔍 Checking database status...');
    
    // Try to query clients table
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST106') {
        console.log('❌ Clients table does not exist. Database needs to be set up first.');
        console.log('📝 Please run the complete schema migration first.');
        return false;
      } else {
        console.log('⚠️ Error checking clients table:', error);
      }
    } else {
      console.log('✅ Clients table exists');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Failed to check database:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database setup...');
  
  const dbExists = await checkDatabase();
  
  if (dbExists) {
    await addClientTypeColumn();
  } else {
    console.log('❌ Database schema not found. You need to set up the database first.');
    console.log('💡 Possible solutions:');
    console.log('   1. Run Supabase migrations via dashboard');
    console.log('   2. Manually create tables via SQL editor');
    console.log('   3. Contact admin to set up database');
  }
}

main().catch(console.error);