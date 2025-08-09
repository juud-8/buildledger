const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lncppcvrhdduvobirzsv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuY3BwY3ZyaGRkdXZvYmlyenN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDM1NDczNiwiZXhwIjoyMDY5OTMwNzM2fQ.x3IG9nJIJSTeP42mQ9f6VcdtvafZhof31KgEjhLkr-k'
);

console.log('🔧 Creating brand_guidelines table...');

const createTableSQL = `
-- Create brand_guidelines table
CREATE TABLE IF NOT EXISTS public.brand_guidelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branding_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  guideline_type TEXT NOT NULL CHECK (guideline_type IN ('color_palette', 'typography', 'logo_usage', 'spacing', 'imagery', 'tone_voice')),
  title TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  is_enforced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view company brand guidelines" ON public.brand_guidelines;
DROP POLICY IF EXISTS "Users can create company brand guidelines" ON public.brand_guidelines;
DROP POLICY IF EXISTS "Users can update company brand guidelines" ON public.brand_guidelines;
DROP POLICY IF EXISTS "Users can delete company brand guidelines" ON public.brand_guidelines;

-- Policy for users to see their company's guidelines
CREATE POLICY "Users can view company brand guidelines" ON public.brand_guidelines
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Policy for users to insert guidelines for their company
CREATE POLICY "Users can create company brand guidelines" ON public.brand_guidelines
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Policy for users to update their company's guidelines
CREATE POLICY "Users can update company brand guidelines" ON public.brand_guidelines
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Policy for users to delete their company's guidelines
CREATE POLICY "Users can delete company brand guidelines" ON public.brand_guidelines
  FOR DELETE USING (
    company_id IN (
      SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_company_id ON public.brand_guidelines(company_id);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_user_id ON public.brand_guidelines(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_type ON public.brand_guidelines(guideline_type);
`;

async function createBrandGuidelinesTable() {
  try {
    // First, let's try to check if the table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('brand_guidelines')
      .select('count')
      .limit(1);

    if (!checkError) {
      console.log('✅ brand_guidelines table already exists!');
      return true;
    }

    // Table doesn't exist, create it
    console.log('Creating brand_guidelines table...');
    
    // Execute the SQL using raw query
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.error('❌ Error creating table via RPC:', error);
      
      // Try alternative method - execute parts separately
      console.log('Trying alternative approach...');
      
      // Just create a minimal table for now
      const { error: simpleError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'brand_guidelines')
        .single();
        
      if (simpleError) {
        console.log('📝 brand_guidelines table does not exist, will create via SQL editor');
        console.log('Please run this SQL in Supabase SQL editor:');
        console.log(createTableSQL);
        return false;
      }
      
      return false;
    }

    console.log('✅ brand_guidelines table created successfully!');
    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('📝 Please create the table manually via Supabase SQL editor:');
    console.log(createTableSQL);
    return false;
  }
}

createBrandGuidelinesTable().then(success => {
  if (!success) {
    console.log('❌ Failed to create brand_guidelines table automatically');
    console.log('You may need to create it manually in Supabase dashboard');
  }
});