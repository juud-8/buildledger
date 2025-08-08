#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lncppcvrhdduvobirzsv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM1NDczNiwiZXhwIjoyMDY5OTMwNzM2fQ.x3IG9nJIJSTeP42mQ9f6VcdtvafZhof31KgEjhLkr-k'
);

async function fixDatabase() {
  try {
    console.log('🔧 Checking current database state...');
    
    // First check if client_type column exists by trying to select it
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('client_type')
      .limit(1);
    
    if (testError) {
      if (testError.code === 'PGRST116') {
        console.log('❌ client_type column is missing');
        console.log('🚫 Cannot automatically add columns via Supabase client API');
        console.log('');
        console.log('SOLUTION: Run this SQL in Supabase Dashboard:');
        console.log('=========================================');
        console.log(`
-- Go to https://supabase.com/dashboard/project/lncppcvrhdduvobirzsv/sql/
-- Copy and paste this SQL:

CREATE TYPE IF NOT EXISTS public.client_type AS ENUM ('residential', 'commercial', 'industrial', 'government');

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS client_type public.client_type DEFAULT 'residential';

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'net30',
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'email';

CREATE INDEX IF NOT EXISTS idx_clients_client_type ON public.clients(client_type);
`);
        console.log('=========================================');
        return false;
      } else {
        console.error('❌ Unexpected error:', testError);
        return false;
      }
    } else {
      console.log('✅ client_type column already exists!');
      
      // Test creating a sample client to verify everything works
      console.log('🧪 Testing client creation...');
      
      const testClient = {
        name: 'Test Client ' + Date.now(),
        email: 'test@example.com',
        client_type: 'residential',
        payment_terms: 'net30',
        preferred_contact_method: 'email',
        is_active: true
      };
      
      const { data: createData, error: createError } = await supabase
        .from('clients')
        .insert(testClient)
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Test client creation failed:', createError);
        return false;
      } else {
        console.log('✅ Test client created successfully:', createData.name);
        
        // Clean up test client
        await supabase.from('clients').delete().eq('id', createData.id);
        console.log('🧹 Cleaned up test client');
        
        return true;
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

console.log('🚀 Starting automatic database fix...');
fixDatabase().then(success => {
  if (success) {
    console.log('🎉 Database is ready! Client creation should work now.');
  } else {
    console.log('❌ Manual intervention required - follow SQL instructions above.');
  }
}).catch(console.error);