-- BuildLedger Database Synchronization Migration
-- This migration synchronizes the local database schema with the live Supabase database
-- Run this SQL in your Supabase SQL Editor to ensure consistency

-- ============================================================================
-- 1. UPDATE PROFILES TABLE STRUCTURE
-- ============================================================================

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add default_payment_terms if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'default_payment_terms') THEN
        ALTER TABLE profiles ADD COLUMN default_payment_terms INTEGER DEFAULT 30;
    END IF;

    -- Add default_tax_rate if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'default_tax_rate') THEN
        ALTER TABLE profiles ADD COLUMN default_tax_rate NUMERIC DEFAULT 0;
    END IF;

    -- Add business_address if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'business_address') THEN
        ALTER TABLE profiles ADD COLUMN business_address TEXT;
    END IF;

    -- Add business_phone if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'business_phone') THEN
        ALTER TABLE profiles ADD COLUMN business_phone TEXT;
    END IF;

    -- Add business_email if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'business_email') THEN
        ALTER TABLE profiles ADD COLUMN business_email TEXT;
    END IF;

    -- Add settings if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'settings') THEN
        ALTER TABLE profiles ADD COLUMN settings JSONB DEFAULT '{}';
    END IF;

    -- Add subscription_status if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'active' 
        CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing'));
    END IF;

    -- Add stripe_customer_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
    END IF;

    -- Add stripe_subscription_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
    END IF;

    -- Add updated_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- 2. UPDATE CLIENTS TABLE STRUCTURE
-- ============================================================================

-- Add missing columns to clients table if they don't exist
DO $$ 
BEGIN
    -- Add notes if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'notes') THEN
        ALTER TABLE clients ADD COLUMN notes TEXT;
    END IF;

    -- Add tags if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'tags') THEN
        ALTER TABLE clients ADD COLUMN tags TEXT[];
    END IF;

    -- Add contact_person if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'contact_person') THEN
        ALTER TABLE clients ADD COLUMN contact_person TEXT;
    END IF;

    -- Add website if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'website') THEN
        ALTER TABLE clients ADD COLUMN website TEXT;
    END IF;

    -- Add industry if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'industry') THEN
        ALTER TABLE clients ADD COLUMN industry TEXT;
    END IF;

    -- Add total_invoiced if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'total_invoiced') THEN
        ALTER TABLE clients ADD COLUMN total_invoiced NUMERIC DEFAULT 0;
    END IF;

    -- Add total_paid if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'total_paid') THEN
        ALTER TABLE clients ADD COLUMN total_paid NUMERIC DEFAULT 0;
    END IF;

    -- Add last_invoice_date if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'last_invoice_date') THEN
        ALTER TABLE clients ADD COLUMN last_invoice_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add payment_terms if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'payment_terms') THEN
        ALTER TABLE clients ADD COLUMN payment_terms INTEGER DEFAULT 30;
    END IF;

    -- Add tax_exempt if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'tax_exempt') THEN
        ALTER TABLE clients ADD COLUMN tax_exempt BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ============================================================================
-- 3. UPDATE INVOICES TABLE STRUCTURE
-- ============================================================================

-- Add missing columns to invoices table if they don't exist
DO $$ 
BEGIN
    -- Add invoice_number if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'invoice_number') THEN
        ALTER TABLE invoices ADD COLUMN invoice_number TEXT;
    END IF;

    -- Add notes if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'notes') THEN
        ALTER TABLE invoices ADD COLUMN notes TEXT;
    END IF;

    -- Add updated_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invoices' AND column_name = 'updated_at') THEN
        ALTER TABLE invoices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- 4. UPDATE QUOTES TABLE STRUCTURE
-- ============================================================================

-- Add missing columns to quotes table if they don't exist
DO $$ 
BEGIN
    -- Add notes if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'notes') THEN
        ALTER TABLE quotes ADD COLUMN notes TEXT;
    END IF;

    -- Add updated_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'quotes' AND column_name = 'updated_at') THEN
        ALTER TABLE quotes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- 5. CREATE TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at functionality
DO $$ 
BEGIN
    -- Profiles table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at 
            BEFORE UPDATE ON profiles 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Clients table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
        CREATE TRIGGER update_clients_updated_at 
            BEFORE UPDATE ON clients 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Quotes table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_quotes_updated_at') THEN
        CREATE TRIGGER update_quotes_updated_at 
            BEFORE UPDATE ON quotes 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Invoices table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at') THEN
        CREATE TRIGGER update_invoices_updated_at 
            BEFORE UPDATE ON invoices 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- 6. CREATE PROFILE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to create profile for new user
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

-- Create trigger for new user profile creation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    END IF;
END $$;

-- Function to get logo URL
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
        logo_url := 'https://' || current_setting('app.settings.supabase_url') || '/storage/v1/object/public/logos/' || user_id || '/' || filename;
    END IF;
    
    RETURN logo_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes if they don't exist
DO $$ 
BEGIN
    -- Profiles indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_plan_tier') THEN
        CREATE INDEX idx_profiles_plan_tier ON profiles(plan_tier);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_subscription_status') THEN
        CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_stripe_customer_id') THEN
        CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
    END IF;

    -- Clients indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_user_id') THEN
        CREATE INDEX idx_clients_user_id ON clients(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_name') THEN
        CREATE INDEX idx_clients_name ON clients(name);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_email') THEN
        CREATE INDEX idx_clients_email ON clients(email);
    END IF;

    -- Invoices indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_user_id') THEN
        CREATE INDEX idx_invoices_user_id ON invoices(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_status') THEN
        CREATE INDEX idx_invoices_status ON invoices(status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_due_date') THEN
        CREATE INDEX idx_invoices_due_date ON invoices(due_date);
    END IF;

    -- Quotes indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quotes_user_id') THEN
        CREATE INDEX idx_quotes_user_id ON quotes(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quotes_status') THEN
        CREATE INDEX idx_quotes_status ON quotes(status);
    END IF;
END $$;

-- ============================================================================
-- 8. ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. CREATE/UPDATE RLS POLICIES
-- ============================================================================

-- Profiles policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
    
    -- Create new policies
    CREATE POLICY "Users can view their own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update their own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Users can insert their own profile" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    
    CREATE POLICY "Users can delete their own profile" ON profiles
        FOR DELETE USING (auth.uid() = id);
END $$;

-- Clients policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "User can manage own clients" ON clients;
    
    -- Create new comprehensive policy
    CREATE POLICY "User can manage own clients" ON clients
        FOR ALL USING (user_id = auth.uid());
END $$;

-- Quotes policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "User can manage own quotes" ON quotes;
    
    -- Create new comprehensive policy
    CREATE POLICY "User can manage own quotes" ON quotes
        FOR ALL USING (user_id = auth.uid());
END $$;

-- Quote items policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "User can manage own quote items" ON quote_items;
    
    -- Create new comprehensive policy
    CREATE POLICY "User can manage own quote items" ON quote_items
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM quotes 
                WHERE quotes.id = quote_items.quote_id 
                AND quotes.user_id = auth.uid()
            )
        );
END $$;

-- Invoices policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "User can manage own invoices" ON invoices;
    
    -- Create new comprehensive policy
    CREATE POLICY "User can manage own invoices" ON invoices
        FOR ALL USING (user_id = auth.uid());
END $$;

-- Invoice items policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "User can manage own invoice items" ON invoice_items;
    
    -- Create new comprehensive policy
    CREATE POLICY "User can manage own invoice items" ON invoice_items
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM invoices 
                WHERE invoices.id = invoice_items.invoice_id 
                AND invoices.user_id = auth.uid()
            )
        );
END $$;

-- ============================================================================
-- 10. VERIFICATION QUERIES
-- ============================================================================

-- Verify table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'clients', 'invoices', 'quotes')
ORDER BY table_name, ordinal_position;

-- Verify triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify indexes
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'clients', 'invoices', 'quotes')
ORDER BY tablename, indexname; 