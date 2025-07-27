-- BuildLedger Database Migration
-- Add profiles table for user plan tiers and settings

-- First, check if profiles table exists and handle migration
DO $$
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Check if it has the old structure (id as primary key referencing auth.users)
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'id' 
            AND data_type = 'uuid'
        ) AND NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'user_id'
        ) THEN
            -- Migrate from old structure to new structure
            ALTER TABLE profiles ADD COLUMN user_id UUID;
            UPDATE profiles SET user_id = id;
            ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
            ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
            
            -- Drop the old primary key constraint and recreate with new structure
            ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
            ALTER TABLE profiles ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
            ALTER TABLE profiles ALTER COLUMN new_id SET NOT NULL;
            ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (new_id);
            ALTER TABLE profiles DROP COLUMN id;
            ALTER TABLE profiles RENAME COLUMN new_id TO id;
            
            RAISE NOTICE 'Migrated existing profiles table to new structure';
        END IF;
    ELSE
        -- Create new profiles table
        CREATE TABLE profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
          name TEXT,
          company_name TEXT,
          logo_url TEXT,
          plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'business')),
          default_payment_terms INTEGER DEFAULT 30,
          default_tax_rate DECIMAL(5,2) DEFAULT 0,
          business_address TEXT,
          business_phone TEXT,
          business_email TEXT,
          settings JSONB DEFAULT '{}',
          subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created new profiles table';
    END IF;
END $$;

-- Add missing columns to profiles table if they don't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_payment_terms INTEGER DEFAULT 30;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_plan_tier_check') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_plan_tier_check 
            CHECK (plan_tier IN ('free', 'pro', 'business'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_status_check') THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check 
            CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing'));
    END IF;
END $$;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_tier ON profiles(plan_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update clients table to add missing fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_invoiced DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_invoice_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE;

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, company_name, plan_tier)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'company_name', 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 