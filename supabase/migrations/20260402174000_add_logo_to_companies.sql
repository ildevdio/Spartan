-- Add logo_url column to companies table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='logo_url') THEN
        ALTER TABLE public.companies ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-logos
DROP POLICY IF EXISTS "Public Access for Logos" ON storage.objects;
CREATE POLICY "Public Access for Logos" ON storage.objects 
FOR SELECT USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated Upload for Logos" ON storage.objects;
CREATE POLICY "Authenticated Upload for Logos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Authenticated Delete for Logos" ON storage.objects;
CREATE POLICY "Authenticated Delete for Logos" ON storage.objects 
FOR DELETE USING (bucket_id = 'company-logos');
