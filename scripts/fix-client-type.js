#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lncppcvrhdduvobirzsv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM1NDczNiwiZXhwIjoyMDY5OTMwNzM2fQ.x3IG9nJIJSTeP42mQ9f6VcdtvafZhof31KgEjhLkr-k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixClientType() {
  try {
    console.log('🔧 Adding missing client_type column...');
    
    // First test if we can access the table
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Cannot access clients table:', testError);
      return;
    }
    
    console.log('✅ Can access clients table, proceeding with column addition...');
    
    // Use raw SQL approach via edge function or direct API
    console.log('⚠️ The client_type column is missing from the clients table.');
    console.log('🛠️ You need to manually add this column via the Supabase dashboard.');
    console.log('');
    console.log('SQL to run in Supabase SQL Editor:');
    console.log('----------------------------------------');
    console.log(`
-- Create enum type for client_type
CREATE TYPE IF NOT EXISTS public.client_type AS ENUM ('residential', 'commercial', 'industrial', 'government');

-- Add client_type column
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS client_type public.client_type DEFAULT 'residential';

-- Add other missing columns
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'net30',
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clients_client_type ON public.clients(client_type);
`);
    console.log('----------------------------------------');
    console.log('');
    console.log('Steps:');
    console.log('1. Go to https://supabase.com/dashboard/project/lncppcvrhdduvobirzsv/sql/');
    console.log('2. Copy and paste the SQL above');
    console.log('3. Click "Run" to execute');
    console.log('4. The client creation should work after this');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixClientType();