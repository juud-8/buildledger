-- Create public storage bucket for company assets (logos, branding)
-- Idempotent: safe to run multiple times

-- 1) Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Public read access to objects in this bucket (needed for getPublicUrl)
DROP POLICY IF EXISTS "Public read company assets" ON storage.objects;
CREATE POLICY "Public read company assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-assets');

-- 3) Allow authenticated users to upload/update/delete only within their own folder prefix
-- Path convention: company-logos/{auth.uid()}/<filename>
DROP POLICY IF EXISTS "Users can upload own logos" ON storage.objects;
CREATE POLICY "Users can upload own logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'company-assets'
  AND name LIKE 'company-logos/' || auth.uid() || '/%'
);

DROP POLICY IF EXISTS "Users can update own logos" ON storage.objects;
CREATE POLICY "Users can update own logos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'company-assets'
  AND name LIKE 'company-logos/' || auth.uid() || '/%'
)
WITH CHECK (
  bucket_id = 'company-assets'
  AND name LIKE 'company-logos/' || auth.uid() || '/%'
);

DROP POLICY IF EXISTS "Users can delete own logos" ON storage.objects;
CREATE POLICY "Users can delete own logos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'company-assets'
  AND name LIKE 'company-logos/' || auth.uid() || '/%'
);


