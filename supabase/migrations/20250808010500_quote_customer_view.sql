-- Add customer-facing view option to quotes
-- Aligns with invoice setting for consistency

ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS show_summary_only BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_quotes_show_summary_only ON public.quotes(show_summary_only);


