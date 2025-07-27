-- BuildLedger Database Synchronization Migration
-- This migration synchronizes the local schema with the current Supabase state

-- 1. Create profiles table if it doesn't exist (missing from local schema)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  company_name TEXT,
  logo_url TEXT,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'business')),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- 2. Update existing tables to reference profiles instead of auth.users
-- First, add missing columns that exist in Supabase

-- Add missing columns to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add missing columns to invoices table  
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add missing columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW();

-- 3. Update foreign key constraints to reference profiles
-- Drop existing constraints
ALTER TABLE IF EXISTS clients DROP CONSTRAINT IF EXISTS clients_user_id_fkey;
ALTER TABLE IF EXISTS quotes DROP CONSTRAINT IF EXISTS quotes_user_id_fkey;
ALTER TABLE IF EXISTS invoices DROP CONSTRAINT IF EXISTS invoices_user_id_fkey;

-- Add new constraints referencing profiles
ALTER TABLE clients ADD CONSTRAINT clients_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE quotes ADD CONSTRAINT quotes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE invoices ADD CONSTRAINT invoices_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. Create trigger for profiles updated_at (missing from current schema)
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for clients updated_at 
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Create logos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true) 
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies for logos bucket
CREATE POLICY "Users can upload their own logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own logos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, plan_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Function to get logo URL with proper error handling
CREATE OR REPLACE FUNCTION public.get_logo_url(user_id UUID, filename TEXT)
RETURNS TEXT AS $$
DECLARE
  logo_url TEXT;
BEGIN
  -- Check if file exists in storage
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        CONCAT(
          current_setting('app.supabase_url'),
          '/storage/v1/object/public/logos/',
          user_id::text,
          '/',
          filename
        )
      ELSE NULL
    END INTO logo_url
  FROM storage.objects 
  WHERE bucket_id = 'logos' 
    AND name = CONCAT(user_id::text, '/', filename);
    
  RETURN logo_url;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_plan_tier ON profiles(plan_tier);
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_user ON storage.objects(bucket_id, (storage.foldername(name))[1]);

-- 11. Update existing users to have profiles (if any exist)
INSERT INTO profiles (id, name, plan_tier)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', email),
  'free'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING; 