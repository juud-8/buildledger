-- Vendor and Material Management Tables
-- This migration adds vendor and material management functionality

-- 1. Create vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    contact_person TEXT,
    company_name TEXT,
    website TEXT,
    tax_id TEXT,
    payment_terms TEXT DEFAULT 'Net 30',
    preferred_payment_method TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create materials table
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category public.item_category DEFAULT 'materials',
    unit TEXT DEFAULT 'each',
    sku TEXT,
    vendor_sku TEXT,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    profit_margin DECIMAL(5,2),
    minimum_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    lead_time_days INTEGER DEFAULT 0,
    specifications JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create vendor_materials table for many-to-many relationship
CREATE TABLE public.vendor_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    vendor_sku TEXT,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    lead_time_days INTEGER DEFAULT 0,
    minimum_order_quantity DECIMAL(10,2) DEFAULT 1,
    is_preferred BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, material_id)
);

-- 4. Create cost_tracking table for historical cost data
CREATE TABLE public.cost_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    cost DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_vendors_company_id ON public.vendors(company_id);
CREATE INDEX idx_vendors_name ON public.vendors(name);
CREATE INDEX idx_materials_company_id ON public.materials(company_id);
CREATE INDEX idx_materials_vendor_id ON public.materials(vendor_id);
CREATE INDEX idx_materials_category ON public.materials(category);
CREATE INDEX idx_materials_sku ON public.materials(sku);
CREATE INDEX idx_vendor_materials_vendor_id ON public.vendor_materials(vendor_id);
CREATE INDEX idx_vendor_materials_material_id ON public.vendor_materials(material_id);
CREATE INDEX idx_cost_tracking_company_id ON public.cost_tracking(company_id);
CREATE INDEX idx_cost_tracking_material_id ON public.cost_tracking(material_id);
CREATE INDEX idx_cost_tracking_effective_date ON public.cost_tracking(effective_date);

-- Add RLS policies for multi-tenancy
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_tracking ENABLE ROW LEVEL SECURITY;

-- Vendors policies
CREATE POLICY "Users can view vendors in their company" ON public.vendors
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert vendors in their company" ON public.vendors
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update vendors in their company" ON public.vendors
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete vendors in their company" ON public.vendors
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

-- Materials policies
CREATE POLICY "Users can view materials in their company" ON public.materials
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert materials in their company" ON public.materials
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update materials in their company" ON public.materials
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete materials in their company" ON public.materials
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

-- Vendor materials policies
CREATE POLICY "Users can view vendor_materials through company" ON public.vendor_materials
    FOR SELECT USING (
        vendor_id IN (
            SELECT id FROM public.vendors WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert vendor_materials through company" ON public.vendor_materials
    FOR INSERT WITH CHECK (
        vendor_id IN (
            SELECT id FROM public.vendors WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update vendor_materials through company" ON public.vendor_materials
    FOR UPDATE USING (
        vendor_id IN (
            SELECT id FROM public.vendors WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete vendor_materials through company" ON public.vendor_materials
    FOR DELETE USING (
        vendor_id IN (
            SELECT id FROM public.vendors WHERE company_id IN (
                SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
            )
        )
    );

-- Cost tracking policies
CREATE POLICY "Users can view cost_tracking in their company" ON public.cost_tracking
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert cost_tracking in their company" ON public.cost_tracking
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update cost_tracking in their company" ON public.cost_tracking
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete cost_tracking in their company" ON public.cost_tracking
    FOR DELETE USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles WHERE id = auth.uid()
        )
    );

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_vendor_materials_updated_at BEFORE UPDATE ON public.vendor_materials
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();