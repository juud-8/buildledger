-- Client Messaging Schema
-- This migration creates tables and types for Twilio SMS messaging functionality

-- Create message status enum
CREATE TYPE public.message_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'replied');
CREATE TYPE public.message_direction AS ENUM ('outbound', 'inbound');
CREATE TYPE public.message_template_type AS ENUM ('quote_reminder', 'payment_followup', 'project_update', 'custom');

-- Create client_message_consent table (opt-in tracking)
CREATE TABLE public.client_message_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    has_consented BOOLEAN DEFAULT false,
    consent_date TIMESTAMPTZ,
    consent_ip TEXT,
    consent_user_agent TEXT,
    opted_out BOOLEAN DEFAULT false,
    opted_out_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, phone_number)
);

-- Create message_templates table
CREATE TABLE public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type public.message_template_type NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names like ["client_name", "amount", "due_date"]
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create client_messages table (message log)
CREATE TABLE public.client_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    direction public.message_direction NOT NULL,
    phone_number TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status public.message_status DEFAULT 'pending',
    twilio_sid TEXT, -- Twilio message SID for tracking
    twilio_error_code TEXT,
    twilio_error_message TEXT,
    related_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    related_quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
    related_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional context/data
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_client_message_consent_client_id ON public.client_message_consent(client_id);
CREATE INDEX idx_client_message_consent_company_id ON public.client_message_consent(company_id);
CREATE INDEX idx_client_message_consent_phone ON public.client_message_consent(phone_number);

CREATE INDEX idx_message_templates_company_id ON public.message_templates(company_id);
CREATE INDEX idx_message_templates_type ON public.message_templates(template_type);

CREATE INDEX idx_client_messages_company_id ON public.client_messages(company_id);
CREATE INDEX idx_client_messages_client_id ON public.client_messages(client_id);
CREATE INDEX idx_client_messages_direction ON public.client_messages(direction);
CREATE INDEX idx_client_messages_status ON public.client_messages(status);
CREATE INDEX idx_client_messages_twilio_sid ON public.client_messages(twilio_sid);
CREATE INDEX idx_client_messages_phone ON public.client_messages(phone_number);
CREATE INDEX idx_client_messages_sent_at ON public.client_messages(sent_at);

-- Insert default message templates
INSERT INTO public.message_templates (company_id, name, template_type, content, variables, created_by) VALUES 
(
    NULL, -- This will need to be updated per company
    'Quote Reminder',
    'quote_reminder',
    'Hi {{client_name}}, this is a friendly reminder that your quote #{{quote_number}} for {{quote_title}} ({{quote_amount}}) expires on {{expiry_date}}. Please let us know if you have any questions!',
    '["client_name", "quote_number", "quote_title", "quote_amount", "expiry_date"]'::jsonb,
    NULL
),
(
    NULL,
    'Payment Follow-up', 
    'payment_followup',
    'Hi {{client_name}}, we wanted to follow up on invoice #{{invoice_number}} for {{invoice_amount}} which was due on {{due_date}}. Please let us know if you need any assistance with payment.',
    '["client_name", "invoice_number", "invoice_amount", "due_date"]'::jsonb,
    NULL
),
(
    NULL,
    'Project Update',
    'project_update', 
    'Hi {{client_name}}, we wanted to update you on the progress of your {{project_name}} project. {{update_message}}',
    '["client_name", "project_name", "update_message"]'::jsonb,
    NULL
);

-- Add RLS policies

-- Enable RLS on all tables
ALTER TABLE public.client_message_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;

-- Consent table policies
CREATE POLICY "Users can view consent for their company" ON public.client_message_consent
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage consent for their company" ON public.client_message_consent
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Message templates policies
CREATE POLICY "Users can view templates for their company" ON public.message_templates
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles 
            WHERE id = auth.uid()
        ) OR company_id IS NULL -- Allow global templates
    );

CREATE POLICY "Users can manage templates for their company" ON public.message_templates
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Client messages policies
CREATE POLICY "Users can view messages for their company" ON public.client_messages
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages for their company" ON public.client_messages
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages for their company" ON public.client_messages
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM public.user_profiles 
            WHERE id = auth.uid()
        )
    );