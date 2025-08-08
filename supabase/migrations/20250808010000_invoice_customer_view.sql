-- Add customer-facing view option to invoices
-- Allows rendering invoices as detailed (line items) or summary (grand total only)

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS show_summary_only BOOLEAN DEFAULT false;

-- Index for potential filtering/analytics (optional)
CREATE INDEX IF NOT EXISTS idx_invoices_show_summary_only ON public.invoices(show_summary_only);


