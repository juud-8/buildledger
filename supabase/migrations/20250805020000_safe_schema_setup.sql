-- Location: supabase/migrations/20250805020000_safe_schema_setup.sql
-- Safe schema setup that handles existing objects

-- 1. Create ENUMs safely
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.logo_type AS ENUM ('full_logo', 'icon_only', 'horizontal', 'vertical', 'watermark');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.document_type AS ENUM ('invoice', 'quote', 'letterhead', 'business_card', 'email_signature');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.template_status AS ENUM ('active', 'draft', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.item_category AS ENUM ('materials', 'labor', 'equipment', 'subcontractor', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create tables safely
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'member'::public.user_role,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.company_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    primary_color TEXT DEFAULT '#3B82F6',
    secondary_color TEXT DEFAULT '#1E40AF',
    accent_color TEXT DEFAULT '#F59E0B',
    font_family TEXT DEFAULT 'Inter',
    font_size_base INTEGER DEFAULT 14,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.logo_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    branding_id UUID REFERENCES public.company_branding(id) ON DELETE CASCADE,
    logo_type public.logo_type NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    branding_id UUID REFERENCES public.company_branding(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    document_type public.document_type NOT NULL,
    template_config JSONB NOT NULL DEFAULT '{}',
    logo_position TEXT DEFAULT 'top-left',
    logo_size TEXT DEFAULT 'medium',
    show_logo BOOLEAN DEFAULT true,
    show_watermark BOOLEAN DEFAULT false,
    status public.template_status DEFAULT 'draft'::public.template_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    branding_id UUID REFERENCES public.company_branding(id) ON DELETE CASCADE,
    guideline_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_enforced BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    company TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    status public.project_status DEFAULT 'planning'::public.project_status,
    priority public.priority_level DEFAULT 'medium'::public.priority_level,
    budget_amount DECIMAL(12,2),
    actual_cost DECIMAL(12,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category public.item_category DEFAULT 'materials'::public.item_category,
    unit_price DECIMAL(10,2) NOT NULL,
    unit TEXT DEFAULT 'each',
    sku TEXT,
    cost DECIMAL(10,2),
    profit_margin DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    quote_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status public.quote_status DEFAULT 'draft'::public.quote_status,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status public.invoice_status DEFAULT 'draft'::public.invoice_status,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    due_date DATE,
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.analytics_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create indexes safely
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
    CREATE INDEX IF NOT EXISTS idx_company_branding_user_id ON public.company_branding(user_id);
    CREATE INDEX IF NOT EXISTS idx_logo_assets_user_id ON public.logo_assets(user_id);
    CREATE INDEX IF NOT EXISTS idx_logo_assets_branding_id ON public.logo_assets(branding_id);
    CREATE INDEX IF NOT EXISTS idx_logo_assets_type ON public.logo_assets(logo_type);
    CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON public.document_templates(user_id);
    CREATE INDEX IF NOT EXISTS idx_document_templates_type ON public.document_templates(document_type);
    CREATE INDEX IF NOT EXISTS idx_brand_guidelines_user_id ON public.brand_guidelines(user_id);
    CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
    CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
    CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
    CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
    CREATE INDEX IF NOT EXISTS idx_items_is_active ON public.items(is_active);
    CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
    CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON public.quotes(client_id);
    CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
    CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items(quote_id);
    CREATE INDEX IF NOT EXISTS idx_quote_items_item_id ON public.quote_items(item_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
    CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_invoice_items_item_id ON public.invoice_items(item_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_data_user_id ON public.analytics_data(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_data_metric ON public.analytics_data(metric_name);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logo_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
-- User profiles policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Company branding policies
DROP POLICY IF EXISTS "Users can manage own branding" ON public.company_branding;
CREATE POLICY "Users can manage own branding" ON public.company_branding
    FOR ALL USING (auth.uid() = user_id);

-- Logo assets policies
DROP POLICY IF EXISTS "Users can manage own logo assets" ON public.logo_assets;
CREATE POLICY "Users can manage own logo assets" ON public.logo_assets
    FOR ALL USING (auth.uid() = user_id);

-- Document templates policies
DROP POLICY IF EXISTS "Users can manage own document templates" ON public.document_templates;
CREATE POLICY "Users can manage own document templates" ON public.document_templates
    FOR ALL USING (auth.uid() = user_id);

-- Brand guidelines policies
DROP POLICY IF EXISTS "Users can manage own brand guidelines" ON public.brand_guidelines;
CREATE POLICY "Users can manage own brand guidelines" ON public.brand_guidelines
    FOR ALL USING (auth.uid() = user_id);

-- Clients policies
DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;
CREATE POLICY "Users can manage own clients" ON public.clients
    FOR ALL USING (auth.uid() = user_id);

-- Projects policies
DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
CREATE POLICY "Users can manage own projects" ON public.projects
    FOR ALL USING (auth.uid() = user_id);

-- Items policies
DROP POLICY IF EXISTS "Users can manage own items" ON public.items;
CREATE POLICY "Users can manage own items" ON public.items
    FOR ALL USING (auth.uid() = user_id);

-- Quotes policies
DROP POLICY IF EXISTS "Users can manage own quotes" ON public.quotes;
CREATE POLICY "Users can manage own quotes" ON public.quotes
    FOR ALL USING (auth.uid() = user_id);

-- Quote items policies
DROP POLICY IF EXISTS "Users can manage own quote items" ON public.quote_items;
CREATE POLICY "Users can manage own quote items" ON public.quote_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.quotes 
            WHERE quotes.id = quote_items.quote_id 
            AND quotes.user_id = auth.uid()
        )
    );

-- Invoices policies
DROP POLICY IF EXISTS "Users can manage own invoices" ON public.invoices;
CREATE POLICY "Users can manage own invoices" ON public.invoices
    FOR ALL USING (auth.uid() = user_id);

-- Invoice items policies
DROP POLICY IF EXISTS "Users can manage own invoice items" ON public.invoice_items;
CREATE POLICY "Users can manage own invoice items" ON public.invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.invoices 
            WHERE invoices.id = invoice_items.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

-- Analytics data policies
DROP POLICY IF EXISTS "Users can manage own analytics data" ON public.analytics_data;
CREATE POLICY "Users can manage own analytics data" ON public.analytics_data
    FOR ALL USING (auth.uid() = user_id);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_branding_updated_at ON public.company_branding;
CREATE TRIGGER update_company_branding_updated_at
    BEFORE UPDATE ON public.company_branding
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_templates_updated_at ON public.document_templates;
CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON public.document_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_brand_guidelines_updated_at ON public.brand_guidelines;
CREATE TRIGGER update_brand_guidelines_updated_at
    BEFORE UPDATE ON public.brand_guidelines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 