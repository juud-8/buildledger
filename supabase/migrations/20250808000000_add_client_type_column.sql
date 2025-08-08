-- Add missing client_type column to clients table
-- This fixes the error: Could not find the 'client_type' column of 'clients' in the schema cache

-- Create enum for client types if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.client_type AS ENUM ('residential', 'commercial', 'industrial', 'government');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add client_type column to clients table if it doesn't exist
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

-- Add payment_terms column if it doesn't exist
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

-- Add preferred_contact_method column if it doesn't exist  
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

-- Create index on client_type for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_client_type ON public.clients(client_type);

-- Update any existing clients to have default client_type if null
UPDATE public.clients 
SET client_type = 'residential' 
WHERE client_type IS NULL;