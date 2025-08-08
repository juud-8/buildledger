-- Implement comprehensive RLS policies for company-based data isolation
-- This ensures users can only access data belonging to their company

-- Enable RLS on all relevant tables if not already enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT company_id 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific role/permission
CREATE OR REPLACE FUNCTION public.user_has_permission(required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, implement basic company isolation
  -- Future: expand with role-based permissions
  RETURN (
    SELECT CASE 
      WHEN auth.uid() IS NULL THEN FALSE
      WHEN get_user_company_id() IS NULL THEN FALSE
      ELSE TRUE
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Companies table policies
-- Users can only view their own company
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT USING (
    id = get_user_company_id()
  );

CREATE POLICY "Users can update their own company" ON public.companies
  FOR UPDATE USING (
    id = get_user_company_id()
  );

-- User profiles policies
-- Users can view profiles in their company
CREATE POLICY "Users can view profiles in their company" ON public.user_profiles
  FOR SELECT USING (
    company_id = get_user_company_id() OR 
    id = auth.uid()
  );

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (
    id = auth.uid()
  );

-- Clients table policies
CREATE POLICY "Users can view clients in their company" ON public.clients
  FOR SELECT USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can insert clients for their company" ON public.clients
  FOR INSERT WITH CHECK (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can update clients in their company" ON public.clients
  FOR UPDATE USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can delete clients in their company" ON public.clients
  FOR DELETE USING (
    company_id = get_user_company_id()
  );

-- Projects table policies
CREATE POLICY "Users can view projects in their company" ON public.projects
  FOR SELECT USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can insert projects for their company" ON public.projects
  FOR INSERT WITH CHECK (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can update projects in their company" ON public.projects
  FOR UPDATE USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can delete projects in their company" ON public.projects
  FOR DELETE USING (
    company_id = get_user_company_id()
  );

-- Quotes table policies
CREATE POLICY "Users can view quotes in their company" ON public.quotes
  FOR SELECT USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can insert quotes for their company" ON public.quotes
  FOR INSERT WITH CHECK (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can update quotes in their company" ON public.quotes
  FOR UPDATE USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can delete quotes in their company" ON public.quotes
  FOR DELETE USING (
    company_id = get_user_company_id()
  );

-- Invoices table policies
CREATE POLICY "Users can view invoices in their company" ON public.invoices
  FOR SELECT USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can insert invoices for their company" ON public.invoices
  FOR INSERT WITH CHECK (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can update invoices in their company" ON public.invoices
  FOR UPDATE USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can delete invoices in their company" ON public.invoices
  FOR DELETE USING (
    company_id = get_user_company_id()
  );

-- Items database policies (company-specific items)
CREATE POLICY "Users can view items in their company" ON public.items_database
  FOR SELECT USING (
    company_id = get_user_company_id() OR 
    company_id IS NULL -- Allow global/shared items
  );

CREATE POLICY "Users can insert items for their company" ON public.items_database
  FOR INSERT WITH CHECK (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can update items in their company" ON public.items_database
  FOR UPDATE USING (
    company_id = get_user_company_id()
  );

CREATE POLICY "Users can delete items in their company" ON public.items_database
  FOR DELETE USING (
    company_id = get_user_company_id()
  );

-- Additional tables that might exist
-- Vendors table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vendors') THEN
    ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view vendors in their company" ON public.vendors
      FOR SELECT USING (company_id = get_user_company_id());
      
    CREATE POLICY "Users can manage vendors in their company" ON public.vendors
      FOR ALL USING (company_id = get_user_company_id())
      WITH CHECK (company_id = get_user_company_id());
  END IF;
END
$$;

-- Materials table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'materials') THEN
    ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view materials in their company" ON public.materials
      FOR SELECT USING (company_id = get_user_company_id());
      
    CREATE POLICY "Users can manage materials in their company" ON public.materials
      FOR ALL USING (company_id = get_user_company_id())
      WITH CHECK (company_id = get_user_company_id());
  END IF;
END
$$;

-- Quote items and invoice items (assuming they exist and have company isolation via parent)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quote_items') THEN
    ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view quote items for their company quotes" ON public.quote_items
      FOR SELECT USING (
        quote_id IN (
          SELECT id FROM public.quotes WHERE company_id = get_user_company_id()
        )
      );
      
    CREATE POLICY "Users can manage quote items for their company quotes" ON public.quote_items
      FOR ALL USING (
        quote_id IN (
          SELECT id FROM public.quotes WHERE company_id = get_user_company_id()
        )
      )
      WITH CHECK (
        quote_id IN (
          SELECT id FROM public.quotes WHERE company_id = get_user_company_id()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoice_items') THEN
    ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view invoice items for their company invoices" ON public.invoice_items
      FOR SELECT USING (
        invoice_id IN (
          SELECT id FROM public.invoices WHERE company_id = get_user_company_id()
        )
      );
      
    CREATE POLICY "Users can manage invoice items for their company invoices" ON public.invoice_items
      FOR ALL USING (
        invoice_id IN (
          SELECT id FROM public.invoices WHERE company_id = get_user_company_id()
        )
      )
      WITH CHECK (
        invoice_id IN (
          SELECT id FROM public.invoices WHERE company_id = get_user_company_id()
        )
      );
  END IF;
END
$$;

-- Webhook events table (administrative access only)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'webhook_events') THEN
    ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
    
    -- Only allow service role to access webhook events
    CREATE POLICY "Service role can access webhook events" ON public.webhook_events
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
      
    -- Regular users cannot access webhook events
    CREATE POLICY "Regular users cannot access webhook events" ON public.webhook_events
      FOR ALL TO authenticated
      USING (false)
      WITH CHECK (false);
  END IF;
END
$$;

-- SMS messages table (company isolation)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sms_messages') THEN
    ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view SMS messages for their company" ON public.sms_messages
      FOR SELECT USING (company_id = get_user_company_id());
      
    CREATE POLICY "Users can manage SMS messages for their company" ON public.sms_messages
      FOR ALL USING (company_id = get_user_company_id())
      WITH CHECK (company_id = get_user_company_id());
  END IF;
END
$$;

-- Create indexes for performance on company_id columns
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_company_id ON public.quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_items_database_company_id ON public.items_database(company_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON public.user_profiles(company_id);

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure service role has full access (for webhooks and admin operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;