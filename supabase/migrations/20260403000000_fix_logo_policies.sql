-- FINAL FIX FOR LOGO UPLOAD (Removing JWS requirement)
-- Allow anyone (even without a Supabase session) to upload logos to the company-logos bucket.
-- Since the app uses custom Spartan Licenses, we handle authorization at the app level.

DROP POLICY IF EXISTS "Public Upload for Logos" ON storage.objects;
CREATE POLICY "Public Upload for Logos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'company-logos');

-- Ensure Public access for viewing is also clear
DROP POLICY IF EXISTS "Public Access for Logos" ON storage.objects;
CREATE POLICY "Public Access for Logos" ON storage.objects 
FOR SELECT USING (bucket_id = 'company-logos');

-- Update the bucket to be explicitly public
UPDATE storage.buckets SET public = true WHERE id = 'company-logos';
